import { NextRequest, NextResponse } from "next/server";
import { findClinicsNearOrigin } from "@/lib/clinics/nearby";
import { resolveSearchOrigin } from "@/lib/search-origin";
import { createServerClient } from "@/lib/supabase/server";
import { EXTERNAL_RESOURCES } from "@/lib/types";

const DEFAULT_RADIUS = 25;
const MAX_RADIUS = 100;
const MAX_RESULTS = 50;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const radiusParam = params.get("radius");

  const radius = Math.min(
    Math.max(Number(radiusParam) || DEFAULT_RADIUS, 5),
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
    const clinics = await findClinicsNearOrigin(
      supabase,
      origin,
      radius,
      MAX_RESULTS
    );

    return NextResponse.json({
      zip: origin.zip,
      city: origin.city,
      state: origin.state,
      search_label: origin.label,
      radius_miles: radius,
      total: clinics.length,
      clinics,
      external_resources: EXTERNAL_RESOURCES,
    });
  } catch (err) {
    console.error("Clinic search error:", err);
    return NextResponse.json(
      { error: "Unable to search clinics. Please try again." },
      { status: 500 }
    );
  }
}
