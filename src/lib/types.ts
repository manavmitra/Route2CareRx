export type ClinicSource =
  | "hrsa_fqhc"
  | "hrsa_lookalike"
  | "cms_rural"
  | "uc_davis_student_run";

export type CostLevel = "free" | "sliding_scale" | "low_cost";

export interface Clinic {
  id: string;
  name: string;
  organization_name: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  website: string | null;
  latitude: number;
  longitude: number;
  source: ClinicSource;
  cost_level: CostLevel;
  clinic_type: string | null;
  location_setting: string | null;
  grant_programs: string | null;
  delivers_services: boolean;
  hours_per_week: number | null;
  operational_schedule: string | null;
  operating_calendar: string | null;
  schedule_summary: string | null;
  /** Optional daily hours (Mon–Sun) from external sources when available */
  hours_of_operation: string[];
  services: string[];
  distance_miles?: number;
}

export interface SearchResponse {
  zip: string;
  city: string | null;
  state: string | null;
  radius_miles: number;
  total: number;
  clinics: Clinic[];
  external_resources: ExternalResource[];
}

export interface ExternalResource {
  name: string;
  description: string;
  url: string;
  category: string;
}

export const EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    name: "FreeClinics.com",
    description:
      "Free and income-based clinics — some listings include daily hours",
    url: "https://www.freeclinics.com/",
    category: "Free & Charitable Clinics",
  },
  {
    name: "NAFC Find a Clinic",
    description: "1,400+ free and charitable clinics for uninsured patients",
    url: "https://nafcclinics.org/find-clinic/",
    category: "Free & Charitable Clinics",
  },
  {
    name: "CDC Breast & Cervical Cancer Screening",
    description: "Free or low-cost cancer screening for eligible women",
    url: "https://www.cdc.gov/breast-cervical-cancer-screening/about/screenings.html",
    category: "Cancer Screening",
  },
  {
    name: "SAMHSA FindTreatment.gov",
    description: "Mental health and substance use treatment providers",
    url: "https://findtreatment.gov/",
    category: "Mental Health & Substance Use",
  },
  {
    name: "HRSA Find a Health Center",
    description: "Official HRSA search for community health centers",
    url: "https://findahealthcenter.hrsa.gov/",
    category: "Community Health Centers",
  },
];

export function deriveCostLevel(source: ClinicSource): CostLevel {
  switch (source) {
    case "hrsa_fqhc":
    case "hrsa_lookalike":
      return "sliding_scale";
    case "uc_davis_student_run":
      return "free";
    case "cms_rural":
      return "low_cost";
    default:
      return "low_cost";
  }
}
