import type { SupabaseClient } from "@supabase/supabase-js";
import type { Clinic } from "@/lib/types";
import { haversineMiles } from "@/lib/utils";
import type { SearchOrigin } from "@/lib/search-origin";

export async function findClinicsNearOrigin(
  supabase: SupabaseClient,
  origin: SearchOrigin,
  radius: number,
  maxResults: number
): Promise<Clinic[]> {
  const latDelta = radius / 69;
  const lonDelta = radius / (69 * Math.cos((origin.latitude * Math.PI) / 180));

  const { data: clinics, error } = await supabase
    .from("clinics")
    .select("*")
    .gte("latitude", origin.latitude - latDelta)
    .lte("latitude", origin.latitude + latDelta)
    .gte("longitude", origin.longitude - lonDelta)
    .lte("longitude", origin.longitude + lonDelta)
    .eq("is_active", true);

  if (error) {
    console.error("Clinic search error:", error);
    throw new Error("Unable to search clinics. Please try again.");
  }

  return (clinics ?? [])
    .map((clinic) => ({
      ...(clinic as Clinic),
      hours_of_operation: clinic.hours_of_operation ?? [],
      distance_miles: haversineMiles(
        origin.latitude,
        origin.longitude,
        clinic.latitude,
        clinic.longitude
      ),
    }))
    .filter((c) => c.distance_miles <= radius)
    .sort((a, b) => a.distance_miles - b.distance_miles)
    .slice(0, maxResults);
}
