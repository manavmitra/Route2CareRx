/**
 * Import licensed California pharmacy facilities from DCA public licensee files
 * into the otc_stores Supabase table.
 *
 * Download the Board of Pharmacy file from:
 * https://www.dca.ca.gov/consumers/public_info/
 * (Board of Pharmacy folder — refreshed monthly)
 *
 * Usage:
 *   npm run import-ca-pharmacy-licenses -- --file path/to/pharmacy.csv
 *
 * Or set CA_DCA_PHARMACY_DATA_URL to a direct download URL.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { loadEnv, parseDelimited } from "./load-env";

loadEnv();

const FACILITY_LICENSE_PATTERNS = [
  /^pharmacy$/i,
  /^pharmacy\s/i,
  /outpatient pharmacy/i,
  /community pharmacy/i,
  /institutional pharmacy/i,
  /home infusion/i,
];

const EXCLUDE_LICENSE_PATTERNS = [
  /pharmacist/i,
  /technician/i,
  /intern/i,
  /designated representative/i,
  /wholesale/i,
  /reverse distributor/i,
  /3pl/i,
  /veterinary/i,
];

function isFacilityPharmacyLicense(licenseType: string): boolean {
  const t = licenseType.trim();
  if (!t) return false;
  if (EXCLUDE_LICENSE_PATTERNS.some((p) => p.test(t))) return false;
  return FACILITY_LICENSE_PATTERNS.some((p) => p.test(t));
}

function pickField(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const exact = row[key];
    if (exact?.trim()) return exact.trim();
    const match = Object.entries(row).find(
      ([k]) => k.toLowerCase() === key.toLowerCase()
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

  const url = process.env.CA_DCA_PHARMACY_DATA_URL;
  if (!url) {
    console.error(
      "Provide --file path/to/dca_pharmacy.csv or set CA_DCA_PHARMACY_DATA_URL"
    );
    process.exit(1);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return res.text();
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("Loading California Board of Pharmacy licensee data…");
  const content = await loadLicenseFile();
  const rows = parseDelimited(content);

  const zipCoords = new Map<string, { lat: number; lon: number }>();
  const { data: zips } = await supabase
    .from("zip_codes")
    .select("zip, latitude, longitude")
    .eq("state", "CA");

  for (const z of zips ?? []) {
    zipCoords.set(z.zip, { lat: z.latitude, lon: z.longitude });
  }

  const records: Array<{
    id: string;
    name: string;
    brand: string | null;
    address: string | null;
    city: string | null;
    state: string;
    zip: string | null;
    phone: string | null;
    hours: string | null;
    store_type: string;
    source: string;
    latitude: number;
    longitude: number;
    license_number: string | null;
    is_active: boolean;
  }> = [];

  for (const row of rows) {
    const licenseType = pickField(row, "License Type", "License Type Name");
    const status = pickField(row, "License Status", "Status");
    if (!isFacilityPharmacyLicense(licenseType)) continue;
    if (status && !/current|clear|active/i.test(status)) continue;

    const org = pickField(row, "ORG/Last Name", "Organization/Last Name");
    const first = pickField(row, "First Name");
    const name = org || [first, pickField(row, "Middle Name")].filter(Boolean).join(" ");
    if (!name) continue;

    const address1 = pickField(row, "Address Line 1", "Concatenated First line of address");
    const address2 = pickField(row, "Address Line 2", "Concatenated Second line of address");
    const city = pickField(row, "City", "City name") || null;
    const state = pickField(row, "State") || "CA";
    const zipRaw = pickField(row, "Zip", "Zip code");
    const zip5 = zipRaw.replace(/\D/g, "").slice(0, 5) || null;
    const licenseNumber = pickField(row, "License Number") || null;

    const coords = zip5 ? zipCoords.get(zip5) : null;
    if (!coords) continue;

    records.push({
      id: `ca_pharmacy_board/${licenseNumber ?? name.replace(/\W/g, "_").slice(0, 40)}`,
      name,
      brand: null,
      address: [address1, address2].filter(Boolean).join(", ") || null,
      city,
      state: state.slice(0, 2).toUpperCase(),
      zip: zip5,
      phone: null,
      hours: null,
      website: null,
      store_type: "pharmacy",
      source: "ca_pharmacy_board",
      otc_tier: "likely",
      license_class: licenseType || null,
      latitude: coords.lat,
      longitude: coords.lon,
      license_number: licenseNumber,
      is_active: true,
    });
  }

  console.log(`Parsed ${records.length} licensed California pharmacy facilities`);

  const BATCH = 500;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await supabase.from("otc_stores").upsert(batch, {
      onConflict: "id",
    });
    if (error) {
      console.error("Upsert error:", error.message);
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
