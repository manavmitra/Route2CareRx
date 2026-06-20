import type { OtcRecordTier } from "@/lib/pharmacy-types";

export type CaPharmacyTier = OtcRecordTier | "exclude";

const EXCLUDE_PATTERNS = [
  /non[- ]?resident/i,
  /wholesale/i,
  /reverse distributor/i,
  /\b3pl\b/i,
  /third-party logistics/i,
  /outsourcing facility/i,
  /veterinary/i,
  /designated representative/i,
  /hypodermic/i,
  /pharmacist/i,
  /technician/i,
  /intern/i,
];

const LIKELY_PATTERNS = [/^retail pharmacy/i];

const VERIFY_PATTERNS = [
  /^hospital pharmacy/i,
  /^clinic permit/i,
  /remote dispensing/i,
  /satellite compounding/i,
];

export function classifyCaliforniaPharmacyLicense(
  licenseType: string
): CaPharmacyTier | null {
  const t = licenseType.trim();
  if (!t) return null;
  if (EXCLUDE_PATTERNS.some((p) => p.test(t))) return "exclude";
  if (LIKELY_PATTERNS.some((p) => p.test(t))) return "likely";
  if (VERIFY_PATTERNS.some((p) => p.test(t))) return "verify";
  return null;
}
