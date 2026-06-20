import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { PHARMACY_EXTERNAL_RESOURCES } from "@/lib/pharmacy-types";
import { haversineMiles, isValidZip, normalizeZip } from "@/lib/utils";
import { fetchClinicPharmacies } from "@/lib/pharmacy-sources/clinic-pharmacies";
import {
  fetchGooglePlacesPharmacies,
  isGooglePlacesEnabled,
} from "@/lib/pharmacy-sources/google-places";
import { mergeGooglePlacesWithoutDuplicates } from "@/lib/pharmacy-sources/merge-google";
import { fetchNpiPharmacies } from "@/lib/pharmacy-sources/npi";
import { fetchOpenStreetMapPharmacies } from "@/lib/pharmacy-sources/openstreetmap";
import { dedupeStores } from "@/lib/pharmacy-sources/types";

const DEFAULT_RADIUS = 10;
const MAX_RADIUS = 25;
const MAX_RESULTS = 75;
const MAX_ZIPS_TO_QUERY = 30;

interface ZipRow {
  zip: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

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
    Math.max(Number(radiusParam) || DEFAULT_RADIUS, 3),
    MAX_RADIUS
  );

  const supabase = createServerClient();

  const { data: originZip, error: zipError } = await supabase
    .from("zip_codes")
    .select("zip, city, state, latitude, longitude")
    .eq("zip", zip)
    .single();

  if (zipError || !originZip) {
    return NextResponse.json(
      {
        error:
          "ZIP code not found. Please enter a valid US ZIP code (including territories).",
      },
      { status: 404 }
    );
  }

  const latDelta = radius / 69;
  const lonDelta =
    radius / (69 * Math.cos((originZip.latitude * Math.PI) / 180));

  const { data: zipRows, error: nearbyError } = await supabase
    .from("zip_codes")
    .select("zip, city, state, latitude, longitude")
    .gte("latitude", originZip.latitude - latDelta)
    .lte("latitude", originZip.latitude + latDelta)
    .gte("longitude", originZip.longitude - lonDelta)
    .lte("longitude", originZip.longitude + lonDelta);

  if (nearbyError) {
    console.error("ZIP lookup error:", nearbyError);
    return NextResponse.json(
      { error: "Unable to search stores. Please try again." },
      { status: 500 }
    );
  }

  const nearbyZips = (zipRows as ZipRow[])
    .map((z) => ({
      ...z,
      distance: haversineMiles(
        originZip.latitude,
        originZip.longitude,
        z.latitude,
        z.longitude
      ),
    }))
    .filter((z) => z.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_ZIPS_TO_QUERY);

  const zipCoords = new Map(
    (zipRows as ZipRow[]).map((z) => [
      z.zip,
      { lat: z.latitude, lon: z.longitude },
    ])
  );

  const context = {
    originLat: originZip.latitude,
    originLon: originZip.longitude,
    radiusMiles: radius,
    zipCoords,
  };

  const zipList = nearbyZips.map((z) => z.zip);

  const [osmStores, nppesStores, clinicStores, googlePlaces] =
    await Promise.all([
      fetchOpenStreetMapPharmacies(context),
      fetchNpiPharmacies(context, zipList, zip),
      fetchClinicPharmacies(
        supabase,
        originZip.latitude,
        originZip.longitude,
        radius
      ),
      fetchGooglePlacesPharmacies(context),
    ]);

  let stores = dedupeStores([
    ...osmStores,
    ...nppesStores,
    ...clinicStores,
  ]).filter((s) => s.distance_miles <= radius);

  const googleEnabled = isGooglePlacesEnabled();
  if (googleEnabled && googlePlaces.length > 0) {
    const merged = mergeGooglePlacesWithoutDuplicates(
      stores,
      googlePlaces,
      originZip.latitude,
      originZip.longitude,
      radius
    );
    stores = dedupeStores(merged.stores).filter(
      (s) => s.distance_miles <= radius
    );
  }

  stores.sort((a, b) => a.distance_miles - b.distance_miles);
  stores = stores.slice(0, MAX_RESULTS);

  const sources: string[] = [];
  if (nppesStores.length > 0) sources.push("NPPES (NPI Registry)");
  if (osmStores.length > 0) sources.push("OpenStreetMap");
  if (clinicStores.length > 0) sources.push("HRSA community health centers");
  if (googleEnabled && googlePlaces.length > 0) {
    sources.push("Google Places (hours & coordinates)");
  }

  return NextResponse.json({
    zip,
    city: originZip.city,
    state: originZip.state,
    radius_miles: radius,
    total: stores.length,
    stores,
    sources,
    external_resources: PHARMACY_EXTERNAL_RESOURCES,
    disclaimer:
      "Pharmacy locations and phone numbers from NPPES (CMS NPI Registry), with GPS from OpenStreetMap and Google Places when configured. Hours from Google Places when available. Duplicate locations are merged by name, phone, and proximity. NCPDP DataQ is a separate licensed product for comprehensive inventory. Grocery and big-box stores may sell OTC even if not listed.",
  });
}
