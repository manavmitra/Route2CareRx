import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PHARMACY_EXTERNAL_RESOURCES,
  filterSearchableOtcStores,
  type OtcStore,
} from "@/lib/pharmacy-types";
import { haversineMiles } from "@/lib/utils";
import { fetchStateOtcDatabaseStores } from "@/lib/pharmacy-sources/state-otc-database";
import {
  fetchGooglePlacesPharmacies,
  isGooglePlacesEnabled,
} from "@/lib/pharmacy-sources/google-places";
import { mergeGooglePlacesWithoutDuplicates } from "@/lib/pharmacy-sources/merge-google";
import { fetchNpiPharmacies } from "@/lib/pharmacy-sources/npi";
import { fetchOpenStreetMapPharmacies } from "@/lib/pharmacy-sources/openstreetmap";
import { dedupeStores } from "@/lib/pharmacy-sources/types";
import type { SearchOrigin } from "@/lib/search-origin";
import { nearestZipForCoords } from "@/lib/search-origin";

const MAX_RESULTS = 75;
const MAX_ZIPS_TO_QUERY = 30;

interface ZipRow {
  zip: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface PharmacySearchResult {
  stores: OtcStore[];
  sources: string[];
  zip: string | null;
  city: string | null;
  state: string | null;
}

export async function findPharmaciesNearOrigin(
  supabase: SupabaseClient,
  origin: SearchOrigin,
  radius: number
): Promise<PharmacySearchResult> {
  const latDelta = radius / 69;
  const lonDelta = radius / (69 * Math.cos((origin.latitude * Math.PI) / 180));

  const { data: zipRows, error: nearbyError } = await supabase
    .from("zip_codes")
    .select("zip, city, state, latitude, longitude")
    .gte("latitude", origin.latitude - latDelta)
    .lte("latitude", origin.latitude + latDelta)
    .gte("longitude", origin.longitude - lonDelta)
    .lte("longitude", origin.longitude + lonDelta);

  if (nearbyError) {
    console.error("ZIP lookup error:", nearbyError);
    throw new Error("Unable to search stores. Please try again.");
  }

  const nearbyZips = (zipRows as ZipRow[])
    .map((z) => ({
      ...z,
      distance: haversineMiles(
        origin.latitude,
        origin.longitude,
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
    originLat: origin.latitude,
    originLon: origin.longitude,
    radiusMiles: radius,
    zipCoords,
  };

  const zipList = nearbyZips.map((z) => z.zip);
  const statesInRadius = [...new Set((zipRows as ZipRow[]).map((z) => z.state))];
  const originZip =
    origin.zip ?? (await nearestZipForCoords(supabase, origin.latitude, origin.longitude)) ?? zipList[0] ?? "00000";

  const [osmStores, nppesStores, stateDbStores, googlePlaces] =
    await Promise.all([
      fetchOpenStreetMapPharmacies(context),
      fetchNpiPharmacies(context, zipList, originZip),
      fetchStateOtcDatabaseStores(
        supabase,
        origin.latitude,
        origin.longitude,
        radius,
        origin.state ? [origin.state, ...statesInRadius] : statesInRadius
      ),
      fetchGooglePlacesPharmacies(context),
    ]);

  let stores = filterSearchableOtcStores(
    dedupeStores([...osmStores, ...nppesStores, ...stateDbStores]).filter(
      (s) => s.distance_miles <= radius
    )
  );

  const googleEnabled = isGooglePlacesEnabled();
  if (googleEnabled && googlePlaces.length > 0) {
    const merged = mergeGooglePlacesWithoutDuplicates(
      stores,
      googlePlaces,
      origin.latitude,
      origin.longitude,
      radius
    );
    stores = filterSearchableOtcStores(
      dedupeStores(merged.stores).filter((s) => s.distance_miles <= radius)
    );
  }

  stores.sort((a, b) => a.distance_miles - b.distance_miles);
  stores = stores.slice(0, MAX_RESULTS);

  const sources: string[] = [];
  if (stateDbStores.some((s) => s.source === "tx_pharmacy_board")) {
    sources.push("Texas State Board of Pharmacy (TSBP CSV)");
  }
  if (stateDbStores.some((s) => s.source === "geofabrik_osm")) {
    sources.push("Geofabrik California OSM (database)");
  }
  if (stateDbStores.some((s) => s.source === "ca_pharmacy_board")) {
    sources.push("California Board of Pharmacy (DCA licenses)");
  }
  if (nppesStores.length > 0) sources.push("NPPES (NPI Registry — cross-check)");
  if (osmStores.length > 0) sources.push("OpenStreetMap (live)");
  if (googleEnabled && googlePlaces.length > 0) {
    sources.push("Google Places (hours, website & coordinates)");
  }

  return {
    stores,
    sources,
    zip: origin.zip,
    city: origin.city,
    state: origin.state,
  };
}

export { PHARMACY_EXTERNAL_RESOURCES };
