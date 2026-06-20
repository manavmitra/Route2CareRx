import type { SupabaseClient } from "@supabase/supabase-js";
import {
  geocodeAddress,
  isValidUsCoordinates,
  reverseGeocode,
  type GeocodeResult,
} from "./geocode";
import { isValidZip, normalizeZip } from "./utils";

export interface SearchOrigin {
  latitude: number;
  longitude: number;
  zip: string | null;
  city: string | null;
  state: string | null;
  label: string;
}

export async function resolveSearchOrigin(
  supabase: SupabaseClient,
  params: {
    zip?: string | null;
    address?: string | null;
    lat?: string | null;
    lng?: string | null;
  }
): Promise<{ origin: SearchOrigin } | { error: string }> {
  const { zip: zipParam, address, lat: latParam, lng: lngParam } = params;

  if (latParam && lngParam) {
    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lngParam);
    if (!isValidUsCoordinates(latitude, longitude)) {
      return { error: "Invalid location coordinates." };
    }
    const geo = await reverseGeocode(latitude, longitude);
    return {
      origin: {
        latitude,
        longitude,
        zip: geo?.zip ?? null,
        city: geo?.city ?? null,
        state: geo?.state ?? null,
        label: geo?.label ?? "Your location",
      },
    };
  }

  if (address?.trim()) {
    const geo = await geocodeAddress(address.trim());
    if (!geo) {
      return {
        error:
          "Address not found. Try a street address with city and state, or use ZIP code.",
      };
    }
    if (!isValidUsCoordinates(geo.latitude, geo.longitude)) {
      return { error: "Address must be within the United States." };
    }
    return { origin: geocodeToOrigin(geo) };
  }

  if (zipParam && isValidZip(zipParam)) {
    const zip = normalizeZip(zipParam);
    const { data, error } = await supabase
      .from("zip_codes")
      .select("zip, city, state, latitude, longitude")
      .eq("zip", zip)
      .single();

    if (error || !data) {
      return {
        error:
          "ZIP code not found. Please enter a valid US ZIP code (including territories).",
      };
    }

    return {
      origin: {
        latitude: data.latitude,
        longitude: data.longitude,
        zip: data.zip,
        city: data.city,
        state: data.state,
        label: `${data.city}, ${data.state} ${data.zip}`,
      },
    };
  }

  return { error: "Please enter a ZIP code, address, or use your location." };
}

function geocodeToOrigin(geo: GeocodeResult): SearchOrigin {
  return {
    latitude: geo.latitude,
    longitude: geo.longitude,
    zip: geo.zip,
    city: geo.city,
    state: geo.state,
    label: geo.label,
  };
}

export async function nearestZipForCoords(
  supabase: SupabaseClient,
  latitude: number,
  longitude: number
): Promise<string | null> {
  const latDelta = 0.5;
  const lonDelta = 0.5;

  const { data } = await supabase
    .from("zip_codes")
    .select("zip, latitude, longitude")
    .gte("latitude", latitude - latDelta)
    .lte("latitude", latitude + latDelta)
    .gte("longitude", longitude - lonDelta)
    .lte("longitude", longitude + lonDelta)
    .limit(50);

  if (!data?.length) return null;

  let best: { zip: string; dist: number } | null = null;
  for (const row of data) {
    const d =
      (row.latitude - latitude) ** 2 + (row.longitude - longitude) ** 2;
    if (!best || d < best.dist) best = { zip: row.zip, dist: d };
  }
  return best?.zip ?? null;
}
