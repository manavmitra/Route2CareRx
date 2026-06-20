import type { OtcStore } from "@/lib/pharmacy-types";

export type PharmacyFetchContext = {
  originLat: number;
  originLon: number;
  radiusMiles: number;
  zipCoords: Map<string, { lat: number; lon: number }>;
};

export type PharmacyFetcher = (
  context: PharmacyFetchContext,
  zips: string[]
) => Promise<OtcStore[]>;

export function dedupeStores(stores: OtcStore[]): OtcStore[] {
  const sourcePriority: Record<OtcStore["source"], number> = {
    google_places: 6,
    tx_pharmacy_board: 5,
    ca_pharmacy_board: 5,
    geofabrik_osm: 4,
    openstreetmap: 3,
    nppes: 2,
    hrsa_clinic: 1,
  };

  const byKey = new Map<string, OtcStore>();

  for (const store of stores) {
    const key = storeDedupeKey(store);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, store);
      continue;
    }
    const preferred =
      sourcePriority[store.source] > sourcePriority[existing.source]
        ? store
        : existing;
    const other = preferred === store ? existing : store;
    byKey.set(key, mergeStoreFields(preferred, other));
  }

  return Array.from(byKey.values());
}

function mergeStoreFields(primary: OtcStore, secondary: OtcStore): OtcStore {
  return {
    ...primary,
    address: primary.address ?? secondary.address,
    city: primary.city ?? secondary.city,
    state: primary.state ?? secondary.state,
    zip: primary.zip ?? secondary.zip,
    phone: primary.phone ?? secondary.phone,
    hours: primary.hours ?? secondary.hours,
    website: primary.website ?? secondary.website,
    brand: primary.brand ?? secondary.brand,
    otc_tier: primary.otc_tier ?? secondary.otc_tier,
    license_class: primary.license_class ?? secondary.license_class,
  };
}

function storeDedupeKey(store: OtcStore): string {
  if (store.latitude && store.longitude) {
    return `${Math.round(store.latitude * 1000)}|${Math.round(store.longitude * 1000)}`;
  }
  const name = store.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
  return `${store.zip ?? ""}|${(store.address ?? "").toLowerCase()}|${name}`;
}
