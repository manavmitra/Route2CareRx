import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

const STATE_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL",
  Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
  Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
  "Puerto Rico": "PR", "Virgin Islands": "VI", Guam: "GU", "American Samoa": "AS",
  "Northern Mariana Islands": "MP",
};

function resolveState(abbr: string, fullName: string): string | null {
  const cleaned = abbr.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(cleaned)) return cleaned;
  return STATE_ABBR[fullName.trim()] ?? null;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

async function main() {
  loadEnv();

  const url = process.env.PROJECT_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing PROJECT_URL or SERVICE_ROLE_KEY in .env");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const csvPath = resolve(process.cwd(), "data/us_zip_codes.csv");
  const content = readFileSync(csvPath, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim());

  const zipMap = new Map<
    string,
    { zip: string; city: string; state: string; latitude: number; longitude: number }
  >();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 8) continue;

    const zip = cols[0].replace(/\D/g, "").padStart(5, "0").slice(0, 5);
    const lat = parseFloat(cols[6]);
    const lng = parseFloat(cols[7]);
    const state = resolveState(cols[3] ?? "", cols[2] ?? "");

    if (zip.length !== 5 || isNaN(lat) || isNaN(lng) || !state) continue;

    if (!zipMap.has(zip)) {
      zipMap.set(zip, {
        zip,
        city: cols[1],
        state,
        latitude: lat,
        longitude: lng,
      });
    }
  }

  const zips = Array.from(zipMap.values());
  console.log(`Importing ${zips.length} US ZIP codes...`);

  const BATCH = 1000;
  let imported = 0;

  for (let i = 0; i < zips.length; i += BATCH) {
    const batch = zips.slice(i, i + BATCH);
    const { error } = await supabase.from("zip_codes").upsert(batch, {
      onConflict: "zip",
    });

    if (error) {
      console.error(`Batch failed:`, error.message);
      throw error;
    }

    imported += batch.length;
    if (imported % 5000 === 0 || imported === zips.length) {
      console.log(`  ${imported}/${zips.length}`);
    }
  }

  console.log("ZIP code import complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
