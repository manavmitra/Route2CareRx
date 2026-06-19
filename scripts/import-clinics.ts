import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  buildScheduleSummary,
  deriveServices,
} from "../src/lib/clinic-data";
import { deriveCostLevel, type ClinicSource } from "../src/lib/types";

interface GisEnrichment {
  grantPrograms: string | null;
  deliversServices: boolean;
  isAdministrative: boolean;
  hoursPerWeek: number | null;
  operationalSchedule: string | null;
  operatingCalendar: string | null;
}

function parseHoursPerWeek(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = typeof value === "number" ? value : parseFloat(String(value));
  return !isNaN(num) && num > 0 ? num : null;
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

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.trim()).filter(Boolean);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length - 1) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim();
    });
    rows.push(row);
  }

  return rows;
}

function mapSource(healthCenterType: string): ClinicSource {
  const lower = healthCenterType.toLowerCase();
  if (lower.includes("look-alike") || lower.includes("lookalike")) {
    return "hrsa_lookalike";
  }
  return "hrsa_fqhc";
}

function normalizeWebsite(url: string): string | null {
  if (!url) return null;
  const cleaned = url.trim();
  if (!cleaned) return null;
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  return `https://${cleaned}`;
}

function extractZip(postal: string): string {
  const match = postal.match(/\d{5}/);
  return match ? match[0] : postal.slice(0, 5);
}

async function fetchGisLayer(
  layerUrl: string,
  outFields: string,
  label: string
): Promise<Array<{ bphc: string; attrs: Record<string, unknown> }>> {
  const records: Array<{ bphc: string; attrs: Record<string, unknown> }> = [];
  const pageSize = 2000;
  let offset = 0;

  console.log(`  Fetching ${label}...`);

  while (true) {
    const params = new URLSearchParams({
      where: "1=1",
      outFields,
      returnGeometry: "false",
      f: "json",
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
    });

    const res = await fetch(`${layerUrl}?${params}`);
    if (!res.ok) throw new Error(`${label} GIS fetch failed: ${res.status}`);

    const data = (await res.json()) as {
      features?: Array<{ attributes: Record<string, unknown> }>;
      error?: { message: string };
    };

    if (data.error) {
      throw new Error(`${label}: ${data.error.message}`);
    }

    const features = data.features ?? [];
    if (!features.length) break;

    for (const feature of features) {
      const bphc = String(feature.attributes.BPHC_SITE_NUM ?? "").trim();
      if (!bphc) continue;
      records.push({ bphc, attrs: feature.attributes });
    }

    console.log(`    ${records.length} records`);
    if (features.length < pageSize) break;
    offset += pageSize;
  }

  return records;
}

async function fetchGisEnrichment(): Promise<Map<string, GisEnrichment>> {
  const cachePath = resolve(process.cwd(), "data/gis_enrichment.json");

  if (existsSync(cachePath)) {
    const cached = JSON.parse(readFileSync(cachePath, "utf-8")) as Record<
      string,
      GisEnrichment
    >;
    const sample = Object.values(cached)[0];
    if (sample && "hoursPerWeek" in sample && Object.keys(cached).length > 0) {
      console.log(`Loaded ${Object.keys(cached).length} GIS records from cache`);
      return new Map(Object.entries(cached));
    }
    console.log("Refreshing GIS cache...");
  }

  const hoursLayer =
    "https://gisportal.hrsa.gov/server/rest/services/HealthCareFacilities/PrimaryHealthCareFacilities_FS/MapServer/0/query";
  const servicesLayer =
    "https://gisportal.hrsa.gov/server/rest/services/HealthCareFacilities/HealthCareFacilities/MapServer/18/query";

  console.log("Fetching HRSA ArcGIS enrichment...");

  const [hoursRecords, serviceRecords] = await Promise.all([
    fetchGisLayer(
      hoursLayer,
      "BPHC_SITE_NUM,TOT_OPER_HR_PER_WEEK,HCC_OPER_SCHD_DESC,HCC_CLND_SCHD_DIM_DESC",
      "hours (layer 0)"
    ),
    fetchGisLayer(
      servicesLayer,
      "BPHC_SITE_NUM,HRSA_GRANT_PROG_DESC,SITE_SVC_DELIV_DESC,SITE_ADMIN_DESC",
      "services (layer 18)"
    ),
  ]);

  const map = new Map<string, GisEnrichment>();

  for (const { bphc, attrs } of hoursRecords) {
    map.set(bphc, {
      grantPrograms: null,
      deliversServices: true,
      isAdministrative: false,
      hoursPerWeek: parseHoursPerWeek(attrs.TOT_OPER_HR_PER_WEEK),
      operationalSchedule: String(attrs.HCC_OPER_SCHD_DESC ?? "").trim() || null,
      operatingCalendar:
        String(attrs.HCC_CLND_SCHD_DIM_DESC ?? "").trim() || null,
    });
  }

  for (const { bphc, attrs } of serviceRecords) {
    const existing = map.get(bphc) ?? {
      grantPrograms: null,
      deliversServices: true,
      isAdministrative: false,
      hoursPerWeek: null,
      operationalSchedule: null,
      operatingCalendar: null,
    };

    map.set(bphc, {
      ...existing,
      grantPrograms: String(attrs.HRSA_GRANT_PROG_DESC ?? "").trim() || null,
      deliversServices:
        String(attrs.SITE_SVC_DELIV_DESC ?? "").toLowerCase() === "yes",
      isAdministrative:
        String(attrs.SITE_ADMIN_DESC ?? "").toLowerCase() === "yes",
    });
  }

  writeFileSync(cachePath, JSON.stringify(Object.fromEntries(map)));
  console.log(`Cached ${map.size} GIS records to data/gis_enrichment.json`);
  return map;
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

  const gisData = await fetchGisEnrichment();

  const csvPath = resolve(process.cwd(), "data/hrsa_health_centers.csv");
  const content = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);

  console.log(`Parsed ${rows.length} HRSA records`);

  const clinics = rows
    .filter((row) => {
      const status = row["Site Status Description"]?.toLowerCase();
      const lat = parseFloat(row["Geocoding Artifact Address Primary Y Coordinate"]);
      const lng = parseFloat(row["Geocoding Artifact Address Primary X Coordinate"]);
      return status === "active" && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    })
    .map((row) => {
      const source = mapSource(row["Health Center Type"] ?? "");
      const clinicType = row["Health Center Type Description"] ?? null;
      const locationSetting =
        row["Health Center Service Delivery Site Location Setting Description"] ?? null;
      const bphcSiteNumber = row["BPHC Assigned Number"] ?? "";
      const gis = gisData.get(bphcSiteNumber);

      const operationalSchedule =
        gis?.operationalSchedule ??
        row["Health Center Operational Schedule Description"] ??
        null;
      const operatingCalendar =
        gis?.operatingCalendar ??
        row["Health Center Operating Calendar"] ??
        null;
      const hoursPerWeek =
        gis?.hoursPerWeek ??
        parseHoursPerWeek(row["Operating Hours per Week"]);

      const deliversServices =
        gis?.deliversServices ??
        (clinicType ?? "").toLowerCase().includes("service delivery");

      return {
        external_id: `${row["Health Center Number"]}-${bphcSiteNumber}`,
        health_center_number: row["Health Center Number"] || null,
        bphc_site_number: bphcSiteNumber || null,
        name: row["Site Name"],
        organization_name: row["Health Center Name"] || null,
        address: row["Site Address"],
        city: row["Site City"],
        state: row["Site State Abbreviation"],
        zip: extractZip(row["Site Postal Code"] ?? ""),
        phone: row["Site Telephone Number"] || null,
        website: normalizeWebsite(row["Site Web Address"] ?? ""),
        latitude: parseFloat(row["Geocoding Artifact Address Primary Y Coordinate"]),
        longitude: parseFloat(row["Geocoding Artifact Address Primary X Coordinate"]),
        source,
        cost_level: deriveCostLevel(source),
        clinic_type: clinicType,
        location_setting: locationSetting,
        grant_programs: gis?.grantPrograms ?? null,
        delivers_services: deliversServices,
        hours_per_week: hoursPerWeek,
        operational_schedule: operationalSchedule,
        operating_calendar: operatingCalendar,
        schedule_summary: buildScheduleSummary(
          operationalSchedule,
          operatingCalendar,
          hoursPerWeek
        ),
        services: deriveServices({
          source,
          clinicType,
          locationSetting,
          grantPrograms: gis?.grantPrograms ?? null,
          deliversServices,
          isAdministrative: gis?.isAdministrative ?? false,
        }),
        is_active: true,
      };
    });

  console.log(`Importing ${clinics.length} active clinics...`);

  const BATCH = 500;
  let imported = 0;

  for (let i = 0; i < clinics.length; i += BATCH) {
    const batch = clinics.slice(i, i + BATCH);
    const { error } = await supabase.from("clinics").upsert(batch, {
      onConflict: "external_id",
    });

    if (error) {
      console.error(`Batch ${i / BATCH + 1} failed:`, error.message);
      throw error;
    }

    imported += batch.length;
    console.log(`  ${imported}/${clinics.length}`);
  }

  console.log("HRSA clinic import complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
