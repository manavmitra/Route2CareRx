/**
 * Import California OTC-relevant stores from OpenStreetMap (Geofabrik source)
 * into the otc_stores Supabase table.
 *
 * Uses the Overpass API with California's admin boundary — same data as
 * Geofabrik's california-latest.osm.pbf extract, without downloading 1.2 GB.
 *
 * Usage:
 *   npm run import-ca-osm
 *   npm run import-ca-osm -- --tiles   # slower tiled import if area query times out
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./load-env";
import {
  type OsmElementLike,
  isTraditionalOsmStore,
  osmStoreType,
} from "../src/lib/pharmacy-sources/osm-parse";

loadEnv();

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT =
  "Route2CareRx/1.0 (CA OSM import; https://github.com/manavmitra/Route2CareRx)";

const CA_TILES: Array<{ south: number; west: number; north: number; east: number }> = [
  { south: 32.5, west: -124.5, north: 35.5, east: -120.5 },
  { south: 32.5, west: -120.5, north: 35.5, east: -117.0 },
  { south: 32.5, west: -117.0, north: 35.5, east: -114.0 },
  { south: 35.5, west: -124.5, north: 38.5, east: -120.5 },
  { south: 35.5, west: -120.5, north: 38.5, east: -117.0 },
  { south: 35.5, west: -117.0, north: 38.5, east: -114.0 },
  { south: 38.5, west: -124.5, north: 42.0, east: -120.5 },
  { south: 38.5, west: -120.5, north: 42.0, east: -117.0 },
  { south: 38.5, west: -117.0, north: 42.0, east: -114.0 },
];

function buildCaliforniaQuery(): string {
  return `
    [out:json][timeout:180];
    area["ISO3166-2"="US-CA"]["admin_level"="4"]->.ca;
    (
      node["amenity"="pharmacy"](area.ca);
      way["amenity"="pharmacy"](area.ca);
      node["healthcare"="pharmacy"](area.ca);
      way["healthcare"="pharmacy"](area.ca);
      node["shop"~"^(chemist|drugstore)$"](area.ca);
      way["shop"~"^(chemist|drugstore)$"](area.ca);
    );
    out center tags;
  `.trim();
}

function buildTileQuery(south: number, west: number, north: number, east: number): string {
  return `
    [out:json][timeout:90];
    (
      node["amenity"="pharmacy"](${south},${west},${north},${east});
      way["amenity"="pharmacy"](${south},${west},${north},${east});
      node["healthcare"="pharmacy"](${south},${west},${north},${east});
      way["healthcare"="pharmacy"](${south},${west},${north},${east});
      node["shop"~"^(chemist|drugstore)$"](${south},${west},${north},${east});
      way["shop"~"^(chemist|drugstore)$"](${south},${west},${north},${east});
    );
    out center tags;
  `.trim();
}

function elementToRow(el: OsmElementLike) {
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

  return {
    id: `geofabrik_osm/${el.type}/${el.id}`,
    name,
    brand: tags.brand ?? null,
    address: street,
    city: tags["addr:city"] ?? null,
    state: (tags["addr:state"] ?? "CA").toUpperCase().slice(0, 2),
    zip: zip5,
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    hours: tags.opening_hours ?? null,
    website: tags.website ?? tags["contact:website"] ?? null,
    store_type: osmStoreType(tags),
    source: "geofabrik_osm",
    otc_tier: "likely",
    license_class: null,
    latitude: lat,
    longitude: lon,
    license_number: null,
    is_active: true,
  };
}

async function fetchOverpass(query: string): Promise<OsmElementLike[]> {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { elements?: OsmElementLike[] };
  return data.elements ?? [];
}

async function main() {
  const useTiles = process.argv.includes("--tiles");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const seen = new Map<string, ReturnType<typeof elementToRow>>();
  let elements: OsmElementLike[] = [];

  if (useTiles) {
    console.log("Importing California OSM stores (tiled)…");
    for (const tile of CA_TILES) {
      console.log(`  Tile ${tile.south},${tile.west} → ${tile.north},${tile.east}`);
      const batch = await fetchOverpass(
        buildTileQuery(tile.south, tile.west, tile.north, tile.east)
      );
      elements.push(...batch);
      await new Promise((r) => setTimeout(r, 2000));
    }
  } else {
    console.log("Importing California OSM stores (full state query)…");
    try {
      elements = await fetchOverpass(buildCaliforniaQuery());
    } catch (err) {
      console.error(err);
      console.log("Full query failed — retry with: npm run import-ca-osm -- --tiles");
      process.exit(1);
    }
  }

  for (const el of elements) {
    const row = elementToRow(el);
    if (row) seen.set(row.id, row);
  }

  const records = Array.from(seen.values()).filter(Boolean) as NonNullable<
    ReturnType<typeof elementToRow>
  >[];

  console.log(`Parsed ${records.length} unique California OSM stores`);

  const BATCH = 500;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await supabase.from("otc_stores").upsert(batch, {
      onConflict: "id",
    });
    if (error) {
      console.error("Upsert error:", error.message);
      if (error.code === "42P01") {
        console.error("Run supabase/migrations/20250620000000_otc_stores.sql first.");
      }
      process.exit(1);
    }
    console.log(`  Upserted ${Math.min(i + BATCH, records.length)} / ${records.length}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
