import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { EXTERNAL_RESOURCES, type Clinic } from "@/lib/types";
import { haversineMiles, isValidZip, normalizeZip } from "@/lib/utils";

const DEFAULT_RADIUS = 25;
const MAX_RADIUS = 100;
const MAX_RESULTS = 50;

export async function GET(request: NextRequest) {
  const zipParam = request.nextUrl.searchParams.get("zip");
  const radiusParam = request.nextUrl.searchParams.get("radius");

  if (!zipParam || !isValidZip(zipParam)) {
    return NextResponse.json(
      { error: "Please enter a valid 5-digit US ZIP code." },
      { status: 400 }
    );
  }

  const zip = normalizeZip(zipParam);
  const radius = Math.min(
    Math.max(Number(radiusParam) || DEFAULT_RADIUS, 5),
    MAX_RADIUS
  );

  const supabase = createServerClient();

  const { data: zipData, error: zipError } = await supabase
    .from("zip_codes")
    .select("zip, city, state, latitude, longitude")
    .eq("zip", zip)
    .single();

  if (zipError || !zipData) {
    return NextResponse.json(
      {
        error:
          "ZIP code not found. Please enter a valid US ZIP code (including territories).",
      },
      { status: 404 }
    );
  }

  const latDelta = radius / 69;
  const lonDelta = radius / (69 * Math.cos((zipData.latitude * Math.PI) / 180));

  const { data: clinics, error: clinicError } = await supabase
    .from("clinics")
    .select("*")
    .gte("latitude", zipData.latitude - latDelta)
    .lte("latitude", zipData.latitude + latDelta)
    .gte("longitude", zipData.longitude - lonDelta)
    .lte("longitude", zipData.longitude + lonDelta)
    .eq("is_active", true);

  if (clinicError) {
    console.error("Clinic search error:", clinicError);
    return NextResponse.json(
      { error: "Unable to search clinics. Please try again." },
      { status: 500 }
    );
  }

  const withDistance = (clinics ?? [])
    .map((clinic) => ({
      ...(clinic as Clinic),
      hours_of_operation: clinic.hours_of_operation ?? [],
      distance_miles: haversineMiles(
        zipData.latitude,
        zipData.longitude,
        clinic.latitude,
        clinic.longitude
      ),
    }))
    .filter((c) => c.distance_miles <= radius)
    .sort((a, b) => a.distance_miles - b.distance_miles)
    .slice(0, MAX_RESULTS);

  return NextResponse.json({
    zip,
    city: zipData.city,
    state: zipData.state,
    radius_miles: radius,
    total: withDistance.length,
    clinics: withDistance,
    external_resources: EXTERNAL_RESOURCES,
  });
}
