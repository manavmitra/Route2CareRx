import type { OtcStore } from "@/lib/pharmacy-types";
import { haversineMiles, formatPhone } from "@/lib/utils";
import type { PharmacyFetchContext } from "./types";

const PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";

export interface GooglePlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  nationalPhoneNumber?: string;
  location?: { latitude: number; longitude: number };
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  addressComponents?: Array<{ types: string[]; shortText: string }>;
}

function getApiKey(): string | null {
  return process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY ?? null;
}

function parseAddressComponents(
  components?: GooglePlaceResult["addressComponents"]
): { city: string | null; state: string | null; zip: string | null } {
  if (!components) return { city: null, state: null, zip: null };
  let city: string | null = null;
  let state: string | null = null;
  let zip: string | null = null;
  for (const c of components) {
    if (c.types.includes("locality")) city = c.shortText;
    if (c.types.includes("administrative_area_level_1")) state = c.shortText;
    if (c.types.includes("postal_code")) zip = c.shortText.replace(/\D/g, "").slice(0, 5);
  }
  return { city, state, zip };
}

export function formatGoogleHours(
  hours?: GooglePlaceResult["regularOpeningHours"]
): string | null {
  const lines = hours?.weekdayDescriptions;
  if (!lines?.length) return null;
  return lines.join("; ");
}

export function parseGooglePlace(
  place: GooglePlaceResult,
  originLat: number,
  originLon: number
): OtcStore | null {
  const name = place.displayName?.text;
  const lat = place.location?.latitude;
  const lon = place.location?.longitude;
  if (!name || lat == null || lon == null) return null;

  const { city, state, zip } = parseAddressComponents(place.addressComponents);
  const address =
    place.shortFormattedAddress ?? place.formattedAddress?.split(",")[0] ?? null;

  return {
    id: `google/${place.id}`,
    name,
    brand: null,
    address,
    city,
    state,
    zip: zip || null,
    phone: place.nationalPhoneNumber
      ? formatPhone(place.nationalPhoneNumber)
      : null,
    hours: formatGoogleHours(place.regularOpeningHours),
    store_type: "pharmacy",
    source: "google_places",
    latitude: lat,
    longitude: lon,
    distance_miles: haversineMiles(originLat, originLon, lat, lon),
  };
}

export async function fetchGooglePlacesPharmacies(
  context: PharmacyFetchContext
): Promise<GooglePlaceResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const radiusMeters = Math.min(
    Math.round(context.radiusMiles * 1609.34),
    50000
  );

  try {
    const res = await fetch(PLACES_NEARBY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.nationalPhoneNumber,places.regularOpeningHours,places.addressComponents",
      },
      body: JSON.stringify({
        includedTypes: ["pharmacy"],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: context.originLat,
              longitude: context.originLon,
            },
            radius: radiusMeters,
          },
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("Google Places error:", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as { places?: GooglePlaceResult[] };
    return data.places ?? [];
  } catch (err) {
    console.error("Google Places fetch error:", err);
    return [];
  }
}

export function isGooglePlacesEnabled(): boolean {
  return Boolean(getApiKey());
}
