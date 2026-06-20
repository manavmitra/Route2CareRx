/** Texas TSBP phydsk.csv row (uppercase headers). */
export interface TexasPharmacyRow {
  LIC_NBR?: string;
  PHARMACY_NAME?: string;
  ADDRESS1?: string;
  ADDRESS2?: string;
  CITY?: string;
  STATE?: string;
  ZIP?: string;
  PHONE?: string;
  LIC_STATUS?: string;
  CLASS?: string;
  "PHY TYPE"?: string;
  NUCLEAR?: string;
  [key: string]: string | undefined;
}

export type OtcRecordTier = "likely" | "verify" | "exclude";

export interface TexasPharmacyClassification {
  tier: OtcRecordTier;
  licenseClass: string;
}

const EXCLUDED_CLASS = [
  /institutional\s*\(hospital\)/i,
  /nuclear pharmacy/i,
  /non-?resident/i,
  /central processing/i,
  /institutional sterile compounding/i,
  /non resident sterile compounding/i,
  /freestanding emc/i,
];

const VERIFY_CLASS = [
  /^clinic$/i,
  /community sterile compounding/i,
  /specialty/i,
];

export function classifyTexasPharmacy(
  row: TexasPharmacyRow
): TexasPharmacyClassification {
  const licenseClass = (row.CLASS ?? "").trim();
  const phyType = (row["PHY TYPE"] ?? "").trim();
  const status = (row.LIC_STATUS ?? "").trim();
  const nuclear = (row.NUCLEAR ?? "").trim().toUpperCase() === "Y";

  if (!licenseClass) {
    return { tier: "exclude", licenseClass: "Unknown" };
  }

  if (!/^active$/i.test(status)) {
    return { tier: "exclude", licenseClass };
  }

  if (nuclear || phyType === "Mail Service") {
    return { tier: "exclude", licenseClass };
  }

  if (EXCLUDED_CLASS.some((p) => p.test(licenseClass))) {
    return { tier: "exclude", licenseClass };
  }

  if (/hospital/i.test(phyType)) {
    return { tier: "exclude", licenseClass };
  }

  if (
    licenseClass === "Community Pharmacy" ||
    /^class\s*a\b/i.test(licenseClass)
  ) {
    return { tier: "likely", licenseClass };
  }

  if (
    VERIFY_CLASS.some((p) => p.test(licenseClass)) ||
    phyType === "Clinic"
  ) {
    return { tier: "verify", licenseClass };
  }

  return { tier: "exclude", licenseClass };
}

export function normalizeTexasRow(
  raw: Record<string, string>
): TexasPharmacyRow {
  const row: TexasPharmacyRow = {};
  for (const [k, v] of Object.entries(raw)) {
    row[k.trim().toUpperCase()] = v;
  }
  return row;
}
