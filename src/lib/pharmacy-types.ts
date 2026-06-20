export type OtcRecordTier = "likely" | "verify";

export type PharmacyStoreType = "pharmacy" | "drugstore";

export const TRADITIONAL_OTC_STORE_TYPES: PharmacyStoreType[] = [
  "pharmacy",
  "drugstore",
];

export function isTraditionalOtcStore(
  store: Pick<OtcStore, "store_type">
): boolean {
  return (
    store.store_type === "pharmacy" || store.store_type === "drugstore"
  );
}

export function filterTraditionalOtcStores(stores: OtcStore[]): OtcStore[] {
  return stores.filter(isTraditionalOtcStore);
}

export function isSearchableOtcStore(
  store: Pick<OtcStore, "store_type" | "otc_tier">
): boolean {
  if (!isTraditionalOtcStore(store)) return false;
  const tier = store.otc_tier ?? "likely";
  return tier === "likely" || tier === "verify";
}

export function filterSearchableOtcStores(stores: OtcStore[]): OtcStore[] {
  return stores.filter(isSearchableOtcStore);
}

export type PharmacySource =
  | "nppes"
  | "openstreetmap"
  | "geofabrik_osm"
  | "ca_pharmacy_board"
  | "tx_pharmacy_board"
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
  website: string | null;
  store_type: PharmacyStoreType;
  source: PharmacySource;
  /** likely = Class A / community retail; verify = clinic or specialty — call ahead */
  otc_tier?: OtcRecordTier | null;
  license_class?: string | null;
  latitude: number;
  longitude: number;
  distance_miles: number;
}

export interface PharmacySearchResponse {
  zip: string | null;
  city: string | null;
  state: string | null;
  search_label: string;
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
    name: "Texas TSBP Pharmacy Lists (CSV)",
    description:
      "Official daily-updated CSV of licensed Texas pharmacy facilities",
    url: "https://www.pharmacy.texas.gov/dbsearch/tables.asp",
    category: "Texas Pharmacy Data",
  },
  {
    name: "Geofabrik California OSM",
    description:
      "Free bulk OpenStreetMap extract — retail pharmacies and drugstores",
    url: "https://download.geofabrik.de/north-america/us/california.html",
    category: "California Store Data",
  },
  {
    name: "CA Board of Pharmacy — Verify a License",
    description:
      "Official California pharmacy license lookup and DCA public licensee files",
    url: "https://www.pharmacy.ca.gov/about/verify_lic.shtml",
    category: "California Pharmacy Verification",
  },
  {
    name: "NPPES NPI Registry",
    description:
      "CMS national provider registry — pharmacy organizations and contact info",
    url: "https://npiregistry.cms.hhs.gov/",
    category: "National Pharmacy Providers",
  },
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
