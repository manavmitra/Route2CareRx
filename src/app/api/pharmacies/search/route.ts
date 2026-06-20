import { NextRequest, NextResponse } from "next/server";
import {
  findPharmaciesNearOrigin,
  PHARMACY_EXTERNAL_RESOURCES,
} from "@/lib/pharmacies/nearby";
import { resolveSearchOrigin } from "@/lib/search-origin";
import { createServerClient } from "@/lib/supabase/server";

const DEFAULT_RADIUS = 10;
const MAX_RADIUS = 25;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const radiusParam = params.get("radius");

  const radius = Math.min(
    Math.max(Number(radiusParam) || DEFAULT_RADIUS, 3),
    MAX_RADIUS
  );

  const supabase = createServerClient();

  const resolved = await resolveSearchOrigin(supabase, {
    zip: params.get("zip"),
    address: params.get("address"),
    lat: params.get("lat"),
    lng: params.get("lng"),
  });

  if ("error" in resolved) {
    const status =
      resolved.error.includes("not found") ||
      resolved.error.includes("Invalid location")
        ? 404
        : 400;
    return NextResponse.json({ error: resolved.error }, { status });
  }

  const { origin } = resolved;

  try {
    const { stores, sources } = await findPharmaciesNearOrigin(
      supabase,
      origin,
      radius
    );

    return NextResponse.json({
      zip: origin.zip,
      city: origin.city,
      state: origin.state,
      search_label: origin.label,
      radius_miles: radius,
      total: stores.length,
      stores,
      sources,
      external_resources: PHARMACY_EXTERNAL_RESOURCES,
      disclaimer:
        "Pharmacy locations combine Texas TSBP CSV and California license/OSM imports (when loaded), NPPES (cross-check), live OpenStreetMap, and Google Places when configured. Only traditional retail pharmacies are listed; Texas clinic/specialty pharmacies are flagged to verify OTC availability. Hospital, nuclear, mail-order, and non-resident licenses are excluded. Call ahead to confirm hours.",
    });
  } catch (err) {
    console.error("Pharmacy search error:", err);
    return NextResponse.json(
      { error: "Unable to search stores. Please try again." },
      { status: 500 }
    );
  }
}
