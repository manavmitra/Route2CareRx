import type { ClinicSource } from "./types";

export interface ServiceInput {
  source: ClinicSource;
  clinicType: string | null;
  locationSetting: string | null;
  grantPrograms: string | null;
  deliversServices: boolean;
  isAdministrative: boolean;
}

const GRANT_PROGRAM_SERVICES: Record<string, string> = {
  "Community Health Centers": "Community Health Center (FQHC)",
  "Health Care for the Homeless": "Health Care for People Experiencing Homelessness",
  "Migrant Health Centers": "Migrant & Seasonal Agricultural Worker Health Services",
  "Public Housing": "Public Housing Primary Care",
};

const LOCATION_SETTING_SERVICES: Record<string, string> = {
  school: "School-Based Health Services",
  hospital: "Hospital-Based Clinic",
  "nursing home": "Nursing Home Health Services",
  correctional: "Correctional Facility Health Services",
  "domestic violence": "Domestic Violence Survivor Health Services",
  "transitional care": "Transitional Care Services",
};

export function deriveServices(input: ServiceInput): string[] {
  const services = new Set<string>();
  const type = (input.clinicType ?? "").toLowerCase();
  const isAdminOnly = type === "administrative";
  const isServiceSite =
    type.includes("service delivery") || input.deliversServices;

  if (input.source === "hrsa_fqhc" || input.source === "hrsa_lookalike") {
    services.add("Sliding Fee Scale (Income-Based)");
  }

  if (isAdminOnly && !isServiceSite) {
    services.add("Administrative Office (No Direct Patient Care)");
    return Array.from(services).sort();
  }

  if (isServiceSite) {
    services.add("Primary Care");
    services.add("Preventive Care");
  }

  const programs = (input.grantPrograms ?? "")
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const program of programs) {
    const mapped = GRANT_PROGRAM_SERVICES[program];
    if (mapped) services.add(mapped);
  }

  const setting = (input.locationSetting ?? "").toLowerCase();
  for (const [key, label] of Object.entries(LOCATION_SETTING_SERVICES)) {
    if (setting.includes(key)) services.add(label);
  }

  if (input.source === "cms_rural") {
    services.add("Medicare-Certified Rural Health Clinic");
  }

  return Array.from(services).sort();
}

export function buildScheduleSummary(
  operationalSchedule: string | null,
  operatingCalendar: string | null,
  hoursPerWeek: number | string | null
): string | null {
  const parts: string[] = [];
  const schedule = operationalSchedule?.trim();
  const calendar = operatingCalendar?.trim();

  if (schedule && schedule.toLowerCase() !== "unknown") {
    parts.push(schedule);
  }
  if (calendar && calendar.toLowerCase() !== "unknown") {
    parts.push(calendar);
  }
  if (hoursPerWeek != null && hoursPerWeek !== "") {
    const num =
      typeof hoursPerWeek === "number"
        ? hoursPerWeek
        : parseFloat(String(hoursPerWeek));
    if (!isNaN(num) && num > 0) {
      parts.push(`${formatHoursPerWeek(num)} open for patient care per week`);
    }
  }

  return parts.length ? parts.join(" · ") : null;
}

export function formatHoursPerWeek(hours: number): string {
  if (Number.isInteger(hours)) return `${hours}`;
  return hours.toFixed(1).replace(/\.0$/, "");
}

export interface HrsaOperatingHours {
  hoursPerWeek: number | null;
  operationalSchedule: string | null;
  operatingCalendar: string | null;
}

export function hasHrsaHours(data: HrsaOperatingHours): boolean {
  return (
    (data.hoursPerWeek != null && data.hoursPerWeek > 0) ||
    Boolean(
      data.operationalSchedule &&
        data.operationalSchedule.toLowerCase() !== "unknown"
    ) ||
    Boolean(
      data.operatingCalendar &&
        data.operatingCalendar.toLowerCase() !== "unknown"
    )
  );
}

export function getHrsaHoursDisplay(data: HrsaOperatingHours): Array<{
  label: string;
  value: string;
}> {
  const rows: Array<{ label: string; value: string }> = [];

  if (data.hoursPerWeek != null && data.hoursPerWeek > 0) {
    rows.push({
      label: "Operating hours per week",
      value: `${formatHoursPerWeek(data.hoursPerWeek)} hours/week (HRSA reported)`,
    });
  }

  if (
    data.operationalSchedule &&
    data.operationalSchedule.toLowerCase() !== "unknown"
  ) {
    rows.push({
      label: "Operating schedule",
      value: data.operationalSchedule,
    });
  }

  if (
    data.operatingCalendar &&
    data.operatingCalendar.toLowerCase() !== "unknown"
  ) {
    rows.push({
      label: "Operating calendar",
      value: data.operatingCalendar,
    });
  }

  return rows;
}

export const UC_DAVIS_HOURS_FOOTNOTE =
  "Hours from the UC Davis student-run clinic directory. Schedules vary — call to confirm before visiting.";

export const HRSA_HOURS_FOOTNOTE =
  "HRSA reports total weekly hours and schedule type — not daily Mon–Sun open/close times. Call the clinic to confirm today's hours.";

export const DAILY_HOURS_FOOTNOTE =
  "Daily hours from an external directory. Verify with the clinic before visiting.";
