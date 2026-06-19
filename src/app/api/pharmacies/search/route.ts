import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { OtcStore } from "@/lib/pharmacy-types";
import { haversineMiles, isValidZip, normalizeZip, formatPhone } from "@/lib/utils";

const DEFAULT_RADIUS = 10;
const MAX_RADIUS = 25;
const MAX_RESULTS = 50;
const MAX_ZIPS_TO_QUERY = 20;
const NPI_URL = "https://npiregistry.cms.hhs.gov/api/";

interface NpiAddress {
  address_1: string;
  address_purpose: string;
  city: string;
  state: string;
  postal_code: string;
  telephone_number?: string;
}

interface NpiResult {
  number: string;
  basic: {
    organization_name?: string;
    first_name?: string;
    last_name?: string;
  };
  addresses: NpiAddress[];
  taxonomies: { desc: string; primary: boolean }[];
}

interface ZipRow {
  zip: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

async function fetchPharmaciesForZip(zip: string): Promise<NpiResult[]> {
  const params = new URLSearchParams({
    version: "2.1",
    postal_code: zip,
    taxonomy_description: "Pharmacy",
    limit: "200",
  });

  const res = await fetch(`${NPI_URL}?${params}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { results?: NpiResult[] };
  return data.results ?? [];
}

function parseNpiPharmacy(
  result: NpiResult,
  originLat: number,
  originLon: number,
  zipCoords: Map<string, { lat: number; lon: number }>
): OtcStore | null {
  const loc =
    result.addresses.find((a) => a.address_purpose === "LOCATION") ??
    result.addresses[0];
  if (!loc) return null;

  const name =
    result.basic.organization_name ??
    [result.basic.first_name, result.basic.last_name].filter(Boolean).join(" ");

  if (!name) return null;

  const zip5 = loc.postal_code.replace(/\D/g, "").slice(0, 5);
  const coords = zipCoords.get(zip5);
  const lat = coords?.lat ?? originLat;
  const lon = coords?.lon ?? originLon;

  const isRetail = result.taxonomies.some(
    (t) =>
      t.primary &&
      (t.desc.includes("Community/Retail") || t.desc === "Pharmacy")
  );

  return {
    id: `npi/${result.number}`,
    name,
    brand: null,
    address: loc.address_1,
    city: loc.city,
    state: loc.state,
    zip: zip5,
    phone: loc.telephone_number ? formatPhone(loc.telephone_number) : null,
    hours: null,
    store_type: isRetail ? "pharmacy" : "drugstore",
    latitude: lat,
    longitude: lon,
    distance_miles: haversineMiles(originLat, originLon, lat, lon),
  };
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

  const npiResults = await Promise.all(
    nearbyZips.map((z) => fetchPharmaciesForZip(z.zip))
  );

  const seen = new Set<string>();
  const stores: OtcStore[] = [];

  for (const batch of npiResults) {
    for (const result of batch) {
      const store = parseNpiPharmacy(
        result,
        originZip.latitude,
        originZip.longitude,
        zipCoords
      );
      if (!store || seen.has(store.id)) continue;
      if (store.distance_miles > radius) continue;
      seen.add(store.id);
      stores.push(store);
    }
  }

  stores.sort((a, b) => a.distance_miles - b.distance_miles);

  return NextResponse.json({
    zip,
    city: originZip.city,
    state: originZip.state,
    radius_miles: radius,
    total: Math.min(stores.length, MAX_RESULTS),
    stores: stores.slice(0, MAX_RESULTS),
    source: "CMS NPI Registry",
    disclaimer:
      "Licensed pharmacy locations from the CMS NPI Registry. Distance is approximate (based on ZIP code). Most grocery stores, Walmart, and Target also sell OTC products. Call ahead to confirm hours.",
  });
}
