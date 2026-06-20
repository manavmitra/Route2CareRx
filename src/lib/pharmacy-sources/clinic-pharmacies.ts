import type { SupabaseClient } from "@supabase/supabase-js";
import type { OtcStore } from "@/lib/pharmacy-types";
import { haversineMiles, formatPhone } from "@/lib/utils";

interface ClinicRow {
  id: string;
  name: string;
  organization_name: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  services: string[];
}

function isPharmacyRelated(clinic: ClinicRow): boolean {
  const haystack = [
    clinic.name,
    clinic.organization_name ?? "",
    ...clinic.services,
  ]
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes("pharmacy") ||
    haystack.includes("340b") ||
    haystack.includes("medication access")
  );
}

export async function fetchClinicPharmacies(
  supabase: SupabaseClient,
  originLat: number,
  originLon: number,
  radiusMiles: number
): Promise<OtcStore[]> {
  const latDelta = radiusMiles / 69;
  const lonDelta = radiusMiles / (69 * Math.cos((originLat * Math.PI) / 180));

  const { data, error } = await supabase
    .from("clinics")
    .select(
      "id, name, organization_name, address, city, state, zip, phone, latitude, longitude, services"
    )
    .gte("latitude", originLat - latDelta)
    .lte("latitude", originLat + latDelta)
    .gte("longitude", originLon - lonDelta)
    .lte("longitude", originLon + lonDelta)
    .eq("is_active", true);

  if (error) {
    console.error("Clinic pharmacy lookup error:", error);
    return [];
  }

  const stores: OtcStore[] = [];

  for (const clinic of (data ?? []) as ClinicRow[]) {
    if (!isPharmacyRelated(clinic)) continue;

    const distance = haversineMiles(
      originLat,
      originLon,
      clinic.latitude,
      clinic.longitude
    );
    if (distance > radiusMiles) continue;

    stores.push({
      id: `clinic/${clinic.id}`,
      name: clinic.name,
      brand: clinic.organization_name,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      zip: clinic.zip,
      phone: clinic.phone ? formatPhone(clinic.phone) : null,
      hours: null,
      store_type: "clinic_pharmacy",
      source: "hrsa_clinic",
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      distance_miles: distance,
    });
  }

  return stores;
}
