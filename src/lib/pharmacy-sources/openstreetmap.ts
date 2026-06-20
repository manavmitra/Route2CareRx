import type { OtcStore } from "@/lib/pharmacy-types";
import type { OsmElementLike } from "./osm-parse";
import { parseOsmStoreElement } from "./osm-parse";
import type { PharmacyFetchContext } from "./types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT =
  "Route2CareRx/1.0 (pharmacy search; https://github.com/manavmitra/Route2CareRx)";

function buildOverpassQuery(radiusMeters: number, originLat: number, originLon: number): string {
  return `
    [out:json][timeout:25];
    (
      node["amenity"="pharmacy"](around:${radiusMeters},${originLat},${originLon});
      way["amenity"="pharmacy"](around:${radiusMeters},${originLat},${originLon});
      node["healthcare"="pharmacy"](around:${radiusMeters},${originLat},${originLon});
      way["healthcare"="pharmacy"](around:${radiusMeters},${originLat},${originLon});
      node["shop"~"^(chemist|drugstore)$"](around:${radiusMeters},${originLat},${originLon});
      way["shop"~"^(chemist|drugstore)$"](around:${radiusMeters},${originLat},${originLon});
    );
    out center tags;
  `.trim();
}

export async function fetchOpenStreetMapPharmacies(
  context: PharmacyFetchContext
): Promise<OtcStore[]> {
  const radiusMeters = Math.round(context.radiusMiles * 1609.34);
  const { originLat, originLon } = context;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
      },
      body: `data=${encodeURIComponent(buildOverpassQuery(radiusMeters, originLat, originLon))}`,
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { elements?: OsmElementLike[] };
    const stores: OtcStore[] = [];

    for (const el of data.elements ?? []) {
      const store = parseOsmStoreElement(el, originLat, originLon, "openstreetmap");
      if (!store) continue;
      if (store.distance_miles > context.radiusMiles) continue;
      stores.push(store);
    }

    return stores;
  } catch (err) {
    console.error("OpenStreetMap pharmacy fetch error:", err);
    return [];
  }
}

export { buildOverpassQuery, OVERPASS_URL, USER_AGENT };
