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
  store_type: "pharmacy" | "drugstore";
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
  source: string;
  disclaimer: string;
}
