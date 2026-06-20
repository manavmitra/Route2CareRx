import type { OtcStore } from "@/lib/pharmacy-types";
import { haversineMiles, formatPhone } from "@/lib/utils";
import {
  parseGooglePlace,
  formatGoogleHours,
  type GooglePlaceResult,
} from "./google-places";

const MATCH_RADIUS_MILES = 0.12;

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function namesSimilar(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  return na.slice(0, 10) === nb.slice(0, 10);
}

function phonesMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const da = a.replace(/\D/g, "").slice(-10);
  const db = b.replace(/\D/g, "").slice(-10);
  return da.length === 10 && da === db;
}

function findMatchingIndex(
  stores: OtcStore[],
  place: GooglePlaceResult
): number {
  const name = place.displayName?.text ?? "";
  const lat = place.location?.latitude;
  const lon = place.location?.longitude;
  if (lat == null || lon == null) return -1;

  const phone = place.nationalPhoneNumber ?? null;

  for (let i = 0; i < stores.length; i++) {
    const store = stores[i];
    const dist = haversineMiles(store.latitude, store.longitude, lat, lon);
    if (dist > MATCH_RADIUS_MILES) continue;
    if (namesSimilar(store.name, name) || phonesMatch(store.phone, phone)) {
      return i;
    }
  }
  return -1;
}

function enrichFromGoogle(
  store: OtcStore,
  place: GooglePlaceResult,
  originLat: number,
  originLon: number
): OtcStore {
  const lat = place.location?.latitude;
  const lon = place.location?.longitude;
  const hours = formatGoogleHours(place.regularOpeningHours);

  const nextLat = lat ?? store.latitude;
  const nextLon = lon ?? store.longitude;

  return {
    ...store,
    latitude: nextLat,
    longitude: nextLon,
    phone:
      store.phone ??
      (place.nationalPhoneNumber
        ? formatPhone(place.nationalPhoneNumber)
        : null),
    hours: hours ?? store.hours,
    distance_miles: haversineMiles(originLat, originLon, nextLat, nextLon),
  };
}

export function mergeGooglePlacesWithoutDuplicates(
  stores: OtcStore[],
  places: GooglePlaceResult[],
  originLat: number,
  originLon: number,
  radiusMiles: number
): { stores: OtcStore[]; enrichedCount: number; addedCount: number } {
  const result = stores.map((s) => ({ ...s }));
  let enrichedCount = 0;
  let addedCount = 0;

  for (const place of places) {
    const matchIdx = findMatchingIndex(result, place);
    if (matchIdx >= 0) {
      const before = result[matchIdx];
      result[matchIdx] = enrichFromGoogle(before, place, originLat, originLon);
      if (
        result[matchIdx].hours !== before.hours ||
        result[matchIdx].latitude !== before.latitude
      ) {
        enrichedCount++;
      }
      continue;
    }

    const parsed = parseGooglePlace(place, originLat, originLon);
    if (!parsed || parsed.distance_miles > radiusMiles) continue;

    const duplicate = result.some(
      (s) =>
        haversineMiles(s.latitude, s.longitude, parsed.latitude, parsed.longitude) <
          MATCH_RADIUS_MILES && namesSimilar(s.name, parsed.name)
    );
    if (duplicate) continue;

    result.push(parsed);
    addedCount++;
  }

  return { stores: result, enrichedCount, addedCount };
}
