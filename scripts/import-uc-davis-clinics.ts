import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { buildScheduleSummary } from "../src/lib/clinic-data";

interface UcDavisClinicRow {
  name: string;
  category: string;
  focus: string;
  servicesNotes: string;
  hours: string;
  accessNotes: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  sourceUrls: string;
}

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
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeWebsite(url: string): string | null {
  const cleaned = url.trim();
  if (!cleaned) return null;
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  return `https://${cleaned}`;
}

function primaryPhone(raw: string): string | null {
  const match = raw.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : raw.trim() || null;
}

function deriveServices(notes: string, focus: string): string[] {
  const services = new Set<string>(["Free Care", "Student-Run Clinic"]);
  const text = `${notes} ${focus}`.toLowerCase();
  const keywords: [RegExp, string][] = [
    [/primary care|acute care/, "Primary Care"],
    [/dental/, "Dental"],
    [/mental health|behavioral health/, "Mental / Behavioral Health"],
    [/vaccin/, "Vaccinations"],
    [/women'?s health|gynecolog|reproductive/, "Women's Health"],
    [/pediatric/, "Pediatric Care"],
    [/cancer|screening/, "Cancer Screening"],
    [/hiv|prep|sti|sexual/, "Sexual Health / HIV / STI"],
    [/harm reduction/, "Harm Reduction"],
    [/gender|transgender|hormone|lgbtq/, "Gender-Affirming Care"],
    [/immigration medical/, "Immigration Medical Exam"],
    [/veterinary|animal/, "Veterinary Care"],
    [/lab|testing/, "Lab Testing"],
    [/specialty/, "Specialty Care"],
    [/prescription/, "Prescription Assistance"],
    [/legal/, "Legal Clinic"],
    [/telehealth/, "Telehealth"],
    [/outreach/, "Community Outreach"],
    [/diabetes|diabetic/, "Diabetes Care"],
    [/dermatolog/, "Dermatology"],
    [/podiatr/, "Podiatry"],
    [/ophthalmolog|vision/, "Vision Care"],
  ];
  for (const [pattern, label] of keywords) {
    if (pattern.test(text)) services.add(label);
  }
  return Array.from(services).sort();
}

async function geocode(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<{ lat: number; lon: number } | null> {
  const candidates = [
    `${address}, ${city}, ${state} ${zip}`,
    address.includes(",")
      ? `${address.split(",").pop()?.trim()}, ${city}, ${state} ${zip}`
      : null,
    `${city}, ${state} ${zip}`,
  ].filter(Boolean) as string[];

  for (const line of candidates) {
    const query = encodeURIComponent(line);
    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${query}&benchmark=Public_AR_Current&format=json`;

    const res = await fetch(url);
    if (!res.ok) continue;

    const data = (await res.json()) as {
      result?: { addressMatches?: Array<{ coordinates?: { x: number; y: number } }> };
    };

    const coords = data.result?.addressMatches?.[0]?.coordinates;
    if (coords) return { lat: coords.y, lon: coords.x };
    await new Promise((r) => setTimeout(r, 200));
  }

  return null;
}

async function geocodeWithZipFallback(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<{ lat: number; lon: number } | null> {
  const direct = await geocode(address, city, state, zip);
  if (direct) return direct;

  const { data: zipRow } = await supabase
    .from("zip_codes")
    .select("latitude, longitude")
    .eq("zip", zip)
    .maybeSingle();

  const zipData = zipRow as { latitude: number; longitude: number } | null;
  if (zipData) return { lat: zipData.latitude, lon: zipData.longitude };
  return null;
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

  const dataPath = resolve(process.cwd(), "data/uc_davis_clinics.json");
  const { clinics } = JSON.parse(readFileSync(dataPath, "utf-8")) as {
    clinics: UcDavisClinicRow[];
  };

  console.log(`Importing ${clinics.length} UC Davis student-run / partner clinics…`);

  const records = [];

  for (const row of clinics) {
    const coords = await geocodeWithZipFallback(
      supabase,
      row.address,
      row.city,
      row.state,
      row.zip
    );
    if (!coords) {
      console.warn(`  Could not geocode: ${row.name}`);
      continue;
    }

    const hours = row.hours.trim();
    const access = row.accessNotes.trim();

    records.push({
      external_id: `ucdavis-${slug(row.name)}`,
      health_center_number: null,
      bphc_site_number: null,
      name: row.name,
      organization_name: "UC Davis School of Medicine — Community Partnerships",
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: primaryPhone(row.phone),
      website: normalizeWebsite(row.website),
      latitude: coords.lat,
      longitude: coords.lon,
      source: "uc_davis_student_run",
      cost_level: "free",
      clinic_type: row.category,
      location_setting: row.focus,
      grant_programs: null,
      delivers_services: true,
      hours_per_week: null,
      operational_schedule: hours || null,
      operating_calendar: access || null,
      schedule_summary: buildScheduleSummary(hours, access, null),
      hours_of_operation: hours ? [hours] : [],
      services: deriveServices(row.servicesNotes, row.focus),
      is_active: true,
    });

    console.log(`  ✓ ${row.name}`);
    await new Promise((r) => setTimeout(r, 300));
  }

  const { error } = await supabase.from("clinics").upsert(records, {
    onConflict: "external_id",
  });

  if (error) {
    console.error("Import failed:", error.message);
    throw error;
  }

  console.log(`UC Davis clinic import complete (${records.length} clinics).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
