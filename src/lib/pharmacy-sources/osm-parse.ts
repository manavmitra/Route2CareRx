import type { OtcStore, PharmacyStoreType } from "@/lib/pharmacy-types";
import { formatPhone, haversineMiles } from "@/lib/utils";

export interface OsmElementLike {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export function osmStoreType(tags: Record<string, string>): PharmacyStoreType {
  if (
    tags.shop === "chemist" ||
    tags.shop === "drugstore" ||
    tags["dispensing"] === "no"
  ) {
    return "drugstore";
  }
  return "pharmacy";
}

export function isTraditionalOsmStore(tags: Record<string, string>): boolean {
  return (
    tags.amenity === "pharmacy" ||
    tags.healthcare === "pharmacy" ||
    tags.shop === "chemist" ||
    tags.shop === "drugstore"
  );
}

export function parseOsmStoreElement(
  el: OsmElementLike,
  originLat: number,
  originLon: number,
  source: OtcStore["source"] = "openstreetmap"
): OtcStore | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;

  const tags = el.tags ?? {};
  if (!isTraditionalOsmStore(tags)) return null;

  const name = tags.name ?? tags.brand ?? tags.operator;
  if (!name) return null;

  const street = tags["addr:street"]
    ? [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ")
    : tags["addr:full"] ?? null;

  const zip5 =
    (tags["addr:postcode"] ?? "").replace(/\D/g, "").slice(0, 5) || null;
  const rawPhone = tags.phone ?? tags["contact:phone"] ?? null;

  return {
    id: `${source}/${el.type}/${el.id}`,
    name,
    brand: tags.brand ?? null,
    address: street,
    city: tags["addr:city"] ?? null,
    state: tags["addr:state"] ?? null,
    zip: zip5,
    phone: rawPhone ? formatPhone(rawPhone) : null,
    hours: tags.opening_hours ?? null,
    website: tags.website ?? tags["contact:website"] ?? null,
    store_type: osmStoreType(tags),
    source,
    otc_tier: "likely",
    latitude: lat,
    longitude: lon,
    distance_miles: haversineMiles(originLat, originLon, lat, lon),
  };
}
