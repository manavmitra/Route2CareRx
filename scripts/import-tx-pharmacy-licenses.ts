/**
 * Import licensed Texas pharmacy facilities from TSBP phydsk.csv
 * into the otc_stores Supabase table.
 *
 * Official download (updated weekdays):
 * https://www.pharmacy.texas.gov/downloads/phydsk.csv
 *
 * Usage:
 *   npm run import-tx-pharmacy-licenses
 *   npm run import-tx-pharmacy-licenses -- --file path/to/phydsk.csv
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  classifyTexasPharmacy,
  normalizeTexasRow,
} from "../src/lib/pharmacy-sources/texas-pharmacy-classify";
import { loadEnv, parseDelimited } from "./load-env";

loadEnv();

const DEFAULT_TX_URL = "https://www.pharmacy.texas.gov/downloads/phydsk.csv";

function pickField(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const exact = row[key];
    if (exact?.trim()) return exact.trim();
    const match = Object.entries(row).find(
      ([k]) => k.toUpperCase() === key.toUpperCase()
    );
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return "";
}

async function loadLicenseFile(): Promise<string> {
  const fileArg = process.argv.indexOf("--file");
  if (fileArg >= 0 && process.argv[fileArg + 1]) {
    return readFileSync(resolve(process.argv[fileArg + 1]), "utf-8");
  }

  const url = process.env.TX_PHARMACY_DATA_URL ?? DEFAULT_TX_URL;
  console.log(`Downloading ${url}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return res.text();
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const content = await loadLicenseFile();
  const rows = parseDelimited(content);

  const zipCoords = new Map<string, { lat: number; lon: number }>();
  const { data: zips } = await supabase
    .from("zip_codes")
    .select("zip, latitude, longitude")
    .eq("state", "TX");

  for (const z of zips ?? []) {
    zipCoords.set(z.zip, { lat: z.latitude, lon: z.longitude });
  }

  const records: Array<Record<string, unknown>> = [];
  let excluded = 0;
  let likely = 0;
  let verify = 0;

  for (const raw of rows) {
    const tx = normalizeTexasRow(raw);
    const { tier, licenseClass } = classifyTexasPharmacy(tx);
    if (tier === "exclude") {
      excluded++;
      continue;
    }

    const name = tx.PHARMACY_NAME?.trim();
    if (!name) continue;

    const zip5 = (tx.ZIP ?? "").replace(/\D/g, "").slice(0, 5) || null;
    const coords = zip5 ? zipCoords.get(zip5) : null;
    if (!coords) continue;

    const licenseNumber = tx.LIC_NBR?.trim() ?? null;
    const phone = tx.PHONE?.trim() || null;

    if (tier === "likely") likely++;
    else verify++;

    records.push({
      id: `tx_pharmacy_board/${licenseNumber ?? name.replace(/\W/g, "_").slice(0, 40)}`,
      name,
      brand: null,
      address: [tx.ADDRESS1, tx.ADDRESS2].filter(Boolean).join(", ") || null,
      city: tx.CITY?.trim() || null,
      state: "TX",
      zip: zip5,
      phone,
      hours: null,
      website: null,
      store_type: "pharmacy",
      source: "tx_pharmacy_board",
      otc_tier: tier,
      license_class: licenseClass,
      latitude: coords.lat,
      longitude: coords.lon,
      license_number: licenseNumber,
      is_active: true,
    });
  }

  console.log(
    `Parsed Texas pharmacies: ${likely} likely OTC, ${verify} verify, ${excluded} excluded`
  );

  const BATCH = 500;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await supabase.from("otc_stores").upsert(batch, {
      onConflict: "id",
    });
    if (error) {
      console.error("Upsert error:", error.message);
      if (error.message.includes("otc_stores")) {
        console.error("Run: npm run db:migrate-otc");
      }
      process.exit(1);
    }
    console.log(`  Upserted ${Math.min(i + BATCH, records.length)} / ${records.length}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
