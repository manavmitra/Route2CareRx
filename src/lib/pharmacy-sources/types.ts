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
    google_places: 4,
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
    const keep =
      sourcePriority[store.source] > sourcePriority[existing.source]
        ? store
        : existing;
    byKey.set(key, keep);
  }

  return Array.from(byKey.values());
}

function storeDedupeKey(store: OtcStore): string {
  if (store.latitude && store.longitude) {
    return `${Math.round(store.latitude * 1000)}|${Math.round(store.longitude * 1000)}`;
  }
  const name = store.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
  return `${store.zip ?? ""}|${(store.address ?? "").toLowerCase()}|${name}`;
}
