const EARTH_RADIUS_MILES = 3958.8;

export function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function normalizeZip(zip: string): string {
  const digits = zip.replace(/\D/g, "").slice(0, 5);
  return digits.padStart(5, "0");
}

export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(normalizeZip(zip));
}

export function formatPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return "Less than 0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export function costLevelLabel(level: string): string {
  switch (level) {
    case "free":
      return "Free";
    case "sliding_scale":
      return "Sliding Fee Scale";
    case "low_cost":
      return "Low Cost";
    default:
      return level;
  }
}

export function costLevelDescription(level: string): string {
  switch (level) {
    case "free":
      return "No charge for eligible patients";
    case "sliding_scale":
      return "Fees based on income — may be free for low-income patients";
    case "low_cost":
      return "Affordable care options available";
    default:
      return "";
  }
}

export function sourceLabel(source: string): string {
  switch (source) {
    case "hrsa_fqhc":
      return "HRSA Community Health Center (FQHC)";
    case "hrsa_lookalike":
      return "HRSA Health Center Look-Alike";
    case "cms_rural":
      return "CMS Rural Health Clinic";
    case "uc_davis_student_run":
      return "UC Davis Student-Run / Partner Clinic";
    default:
      return source;
  }
}
