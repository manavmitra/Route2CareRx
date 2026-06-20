export type PharmacyStoreType =
  | "pharmacy"
  | "drugstore"
  | "clinic_pharmacy";

export type PharmacySource =
  | "nppes"
  | "openstreetmap"
  | "hrsa_clinic"
  | "google_places";

export interface OtcStore {
  id: string;
  name: string;
  brand: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  hours: string | null;
  store_type: PharmacyStoreType;
  source: PharmacySource;
  latitude: number;
  longitude: number;
  distance_miles: number;
}

export interface PharmacySearchResponse {
  zip: string;
  city: string | null;
  state: string | null;
  radius_miles: number;
  total: number;
  stores: OtcStore[];
  sources: string[];
  disclaimer: string;
  external_resources: PharmacyExternalResource[];
}

export interface PharmacyExternalResource {
  name: string;
  description: string;
  url: string;
  category: string;
}

export const PHARMACY_EXTERNAL_RESOURCES: PharmacyExternalResource[] = [
  {
    name: "HRSA Find a Health Center",
    description:
      "Federally funded health centers — many offer onsite pharmacy and sliding-fee medications",
    url: "https://findahealthcenter.hrsa.gov/",
    category: "Community Health Centers",
  },
  {
    name: "NAFC Find a Clinic",
    description:
      "1,400+ free and charitable clinics — some include charitable pharmacy services",
    url: "https://nafcclinics.org/find-clinic/",
    category: "Free & Charitable Clinics",
  },
  {
    name: "FreeClinics.com",
    description:
      "Free and income-based clinics with contact info — some list pharmacy access",
    url: "https://www.freeclinics.com/",
    category: "Free & Charitable Clinics",
  },
  {
    name: "NCPDP Pharmacy Database",
    description:
      "Most comprehensive U.S. pharmacy directory (retail, mail-order, specialty) — licensed data product for drug inventory",
    url: "https://www.ncpdp.org/Products/Pharmacy-Database",
    category: "Pharmacy Directories",
  },
  {
    name: "RxNorm (NLM)",
    description: "Standard drug names and identifiers for U.S. medications",
    url: "https://rxnav.nlm.nih.gov/",
    category: "Medication Information",
  },
  {
    name: "DailyMed (NLM)",
    description: "FDA-approved drug labeling and packaging information",
    url: "https://dailymed.nlm.nih.gov/",
    category: "Medication Information",
  },
];
