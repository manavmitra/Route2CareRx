import type { OtcStore } from "@/lib/pharmacy-types";
import { haversineMiles, formatPhone } from "@/lib/utils";
import type { PharmacyFetchContext } from "./types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "Route2CareRx/1.0 (pharmacy search; https://github.com/manavmitra/Route2CareRx)";

interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function parseOsmElement(
  el: OsmElement,
  originLat: number,
  originLon: number
): OtcStore | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;

  const tags = el.tags ?? {};
  const name = tags.name ?? tags.brand ?? tags.operator;
  if (!name) return null;

  const street = tags["addr:street"]
    ? [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ")
    : tags["addr:full"] ?? null;

  const zip5 = (tags["addr:postcode"] ?? "").replace(/\D/g, "").slice(0, 5) || null;
  const rawPhone = tags.phone ?? tags["contact:phone"] ?? null;

  return {
    id: `osm/${el.type}/${el.id}`,
    name,
    brand: tags.brand ?? null,
    address: street,
    city: tags["addr:city"] ?? null,
    state: tags["addr:state"] ?? null,
    zip: zip5,
    phone: rawPhone ? formatPhone(rawPhone) : null,
    hours: tags.opening_hours ?? null,
    store_type: "pharmacy",
    source: "openstreetmap",
    latitude: lat,
    longitude: lon,
    distance_miles: haversineMiles(originLat, originLon, lat, lon),
  };
}

export async function fetchOpenStreetMapPharmacies(
  context: PharmacyFetchContext
): Promise<OtcStore[]> {
  const radiusMeters = Math.round(context.radiusMiles * 1609.34);
  const { originLat, originLon } = context;

  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="pharmacy"](around:${radiusMeters},${originLat},${originLon});
      way["amenity"="pharmacy"](around:${radiusMeters},${originLat},${originLon});
      node["healthcare"="pharmacy"](around:${radiusMeters},${originLat},${originLon});
      way["healthcare"="pharmacy"](around:${radiusMeters},${originLat},${originLon});
    );
    out center tags;
  `.trim();

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { elements?: OsmElement[] };
    const stores: OtcStore[] = [];

    for (const el of data.elements ?? []) {
      const store = parseOsmElement(el, originLat, originLon);
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
