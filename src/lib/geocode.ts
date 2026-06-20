const USER_AGENT =
  "Route2CareRx/1.0 (https://github.com/manavmitra/Route2CareRx)";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  label: string;
  city: string | null;
  state: string | null;
  zip: string | null;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

function parseNominatim(item: NominatimResult): GeocodeResult {
  const zip = item.address?.postcode?.replace(/\D/g, "").slice(0, 5) ?? null;
  const city =
    item.address?.city ??
    item.address?.town ??
    item.address?.village ??
    null;
  return {
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    label: item.display_name,
    city,
    state: item.address?.state ?? null,
    zip: zip && zip.length === 5 ? zip : null,
  };
}

async function geocodeWithNominatim(query: string): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("q", query);

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as NominatimResult[];
  if (!data.length) return null;
  return parseNominatim(data[0]);
}

async function geocodeWithGoogle(address: string): Promise<GeocodeResult | null> {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", key);
  url.searchParams.set("components", "country:US");

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    results?: Array<{
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
      address_components: Array<{ types: string[]; short_name: string }>;
    }>;
  };

  const result = data.results?.[0];
  if (!result) return null;

  let city: string | null = null;
  let state: string | null = null;
  let zip: string | null = null;
  for (const c of result.address_components) {
    if (c.types.includes("locality")) city = c.short_name;
    if (c.types.includes("administrative_area_level_1")) state = c.short_name;
    if (c.types.includes("postal_code")) {
      zip = c.short_name.replace(/\D/g, "").slice(0, 5);
    }
  }

  return {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    label: result.formatted_address,
    city,
    state,
    zip: zip && zip.length === 5 ? zip : null,
  };
}

export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (trimmed.length < 5) return null;

  const google = await geocodeWithGoogle(trimmed);
  if (google) return google;

  return geocodeWithNominatim(trimmed);
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    return {
      latitude,
      longitude,
      label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: null,
      state: null,
      zip: null,
    };
  }

  const data = (await res.json()) as NominatimResult & {
    display_name: string;
  };

  return {
    ...parseNominatim({
      lat: String(latitude),
      lon: String(longitude),
      display_name: data.display_name,
      address: data.address,
    }),
    latitude,
    longitude,
  };
}

export function isValidUsCoordinates(lat: number, lng: number): boolean {
  return lat >= 18 && lat <= 72 && lng >= -180 && lng <= -65;
}
