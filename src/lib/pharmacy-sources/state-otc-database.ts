import type { SupabaseClient } from "@supabase/supabase-js";
import {
  filterSearchableOtcStores,
  isTraditionalOtcStore,
  type OtcRecordTier,
  type OtcStore,
} from "@/lib/pharmacy-types";
import { haversineMiles } from "@/lib/utils";

const STATES_WITH_IMPORTED_STORES = ["CA", "TX"] as const;

interface OtcStoreRow {
  id: string;
  name: string;
  brand: string | null;
  address: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  phone: string | null;
  hours: string | null;
  website: string | null;
  store_type: OtcStore["store_type"];
  source: OtcStore["source"];
  otc_tier: OtcRecordTier | null;
  license_class: string | null;
  latitude: number;
  longitude: number;
}

function rowToStore(row: OtcStoreRow, originLat: number, originLon: number): OtcStore {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    phone: row.phone,
    hours: row.hours,
    website: row.website,
    store_type: row.store_type,
    source: row.source,
    otc_tier: row.otc_tier ?? "likely",
    license_class: row.license_class,
    latitude: row.latitude,
    longitude: row.longitude,
    distance_miles: haversineMiles(
      originLat,
      originLon,
      row.latitude,
      row.longitude
    ),
  };
}

export function isStateWithImportedStores(
  states: (string | null | undefined)[]
): boolean {
  return states.some((s) =>
    STATES_WITH_IMPORTED_STORES.includes(
      s?.toUpperCase() as (typeof STATES_WITH_IMPORTED_STORES)[number]
    )
  );
}

export async function fetchStateOtcDatabaseStores(
  supabase: SupabaseClient,
  originLat: number,
  originLon: number,
  radiusMiles: number,
  statesInRadius: (string | null)[]
): Promise<OtcStore[]> {
  const states = [
    ...new Set(
      statesInRadius
        .map((s) => s?.toUpperCase())
        .filter((s): s is string =>
          STATES_WITH_IMPORTED_STORES.includes(
            s as (typeof STATES_WITH_IMPORTED_STORES)[number]
          )
        )
    ),
  ];

  if (!states.length) return [];

  const latDelta = radiusMiles / 69;
  const lonDelta = radiusMiles / (69 * Math.cos((originLat * Math.PI) / 180));

  const { data, error } = await supabase
    .from("otc_stores")
    .select(
      "id, name, brand, address, city, state, zip, phone, hours, website, store_type, source, otc_tier, license_class, latitude, longitude"
    )
    .in("state", states)
    .eq("is_active", true)
    .in("store_type", ["pharmacy", "drugstore"])
    .or("otc_tier.in.(likely,verify),otc_tier.is.null")
    .gte("latitude", originLat - latDelta)
    .lte("latitude", originLat + latDelta)
    .gte("longitude", originLon - lonDelta)
    .lte("longitude", originLon + lonDelta);

  if (error) {
    if (error.code === "42P01" || error.message.includes("otc_stores")) {
      console.warn("otc_stores table not found — run: npm run db:migrate-otc");
      return [];
    }
    if (error.code === "42703" || error.message.includes("otc_tier")) {
      return fetchStateOtcDatabaseStoresLegacy(
        supabase,
        originLat,
        originLon,
        radiusMiles,
        states
      );
    }
    console.error("State OTC database lookup error:", error);
    return [];
  }

  return filterSearchableOtcStores(
    ((data ?? []) as OtcStoreRow[])
      .filter((row) => isTraditionalOtcStore(row))
      .map((row) => rowToStore(row, originLat, originLon))
      .filter((s) => s.distance_miles <= radiusMiles)
  );
}

async function fetchStateOtcDatabaseStoresLegacy(
  supabase: SupabaseClient,
  originLat: number,
  originLon: number,
  radiusMiles: number,
  states: string[]
): Promise<OtcStore[]> {
  const latDelta = radiusMiles / 69;
  const lonDelta = radiusMiles / (69 * Math.cos((originLat * Math.PI) / 180));

  const { data, error } = await supabase
    .from("otc_stores")
    .select(
      "id, name, brand, address, city, state, zip, phone, hours, store_type, source, latitude, longitude"
    )
    .in("state", states)
    .eq("is_active", true)
    .in("store_type", ["pharmacy", "drugstore"])
    .gte("latitude", originLat - latDelta)
    .lte("latitude", originLat + latDelta)
    .gte("longitude", originLon - lonDelta)
    .lte("longitude", originLon + lonDelta);

  if (error) return [];

  return filterSearchableOtcStores(
    ((data ?? []) as OtcStoreRow[])
      .filter((row) => isTraditionalOtcStore(row))
      .map((row) =>
        rowToStore(
          {
            ...row,
            website: null,
            otc_tier: "likely",
            license_class: null,
          },
          originLat,
          originLon
        )
      )
      .filter((s) => s.distance_miles <= radiusMiles)
  );
}

/** @deprecated Use fetchStateOtcDatabaseStores */
export const fetchCaOtcDatabaseStores = fetchStateOtcDatabaseStores;

export function isCaliforniaSearch(states: (string | null | undefined)[]): boolean {
  return states.some((s) => s?.toUpperCase() === "CA");
}
