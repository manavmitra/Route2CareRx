import type { OtcStore } from "@/lib/pharmacy-types";
import { geocodeAddress } from "@/lib/geocode";
import { haversineMiles, formatPhone } from "@/lib/utils";
import type { PharmacyFetchContext } from "./types";

const NPI_URL = "https://npiregistry.cms.hhs.gov/api/";

/** NPI taxonomy descriptions for traditional retail pharmacies only. */
const NPI_TAXONOMY_DESCRIPTIONS = [
  "Pharmacy",
  "Community/Retail Pharmacy",
] as const;

const NON_RETAIL_TAXONOMY = /clinic|mail order|institutional|compounding/i;

/** Cap geocode calls per search to keep response times reasonable. */
const MAX_NPI_GEOCODES_PER_SEARCH = 40;
const GEOCODE_CONCURRENCY = 5;

interface NpiAddress {
  address_1: string;
  address_purpose: string;
  city: string;
  state: string;
  postal_code: string;
  telephone_number?: string;
}

interface NpiResult {
  number: string;
  enumeration_type?: string;
  basic: {
    organization_name?: string;
    first_name?: string;
    last_name?: string;
  };
  addresses: NpiAddress[];
  taxonomies: { desc: string; primary: boolean }[];
}

async function fetchNpiForZip(
  zip: string,
  taxonomyDescription: string
): Promise<NpiResult[]> {
  const params = new URLSearchParams({
    version: "2.1",
    postal_code: zip,
    taxonomy_description: taxonomyDescription,
    limit: "200",
  });

  const res = await fetch(`${NPI_URL}?${params}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { results?: NpiResult[] };
  return data.results ?? [];
}

function formatNpiAddress(loc: NpiAddress): string {
  const zip5 = (loc.postal_code ?? "").replace(/\D/g, "").slice(0, 5);
  return [loc.address_1, loc.city, loc.state, zip5].filter(Boolean).join(", ");
}

async function resolveNpiCoordinates(
  loc: NpiAddress,
  zipCoords: Map<string, { lat: number; lon: number }>,
  cache: Map<string, { lat: number; lon: number } | null>,
  geocodeBudget: { remaining: number }
): Promise<{ lat: number; lon: number } | null> {
  const addressKey = formatNpiAddress(loc);
  if (cache.has(addressKey)) {
    return cache.get(addressKey) ?? null;
  }

  let coords: { lat: number; lon: number } | null = null;

  if (geocodeBudget.remaining > 0) {
    geocodeBudget.remaining--;
    const geocoded = await geocodeAddress(addressKey);
    if (geocoded) {
      coords = { lat: geocoded.latitude, lon: geocoded.longitude };
    }
  }

  if (!coords) {
    const zip5 = (loc.postal_code ?? "").replace(/\D/g, "").slice(0, 5);
    const zipCenter = zip5 ? zipCoords.get(zip5) : null;
    if (zipCenter) {
      coords = { lat: zipCenter.lat, lon: zipCenter.lon };
    }
  }

  cache.set(addressKey, coords);
  return coords;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

function parseNpiPharmacy(
  result: NpiResult,
  originLat: number,
  originLon: number,
  coords: { lat: number; lon: number }
): OtcStore | null {
  // Retail OTC search needs pharmacy businesses, not individual pharmacists (NPI-1).
  if (result.enumeration_type === "NPI-1") return null;

  const loc =
    result.addresses.find((a) => a.address_purpose === "LOCATION") ??
    result.addresses[0];
  if (!loc) return null;

  const name = result.basic.organization_name?.trim();
  if (!name) return null;

  const zip5 = (loc.postal_code ?? "").replace(/\D/g, "").slice(0, 5);

  const taxonomyDesc = result.taxonomies.find((t) => t.primary)?.desc ?? "";
  if (NON_RETAIL_TAXONOMY.test(taxonomyDesc)) return null;

  let storeType: OtcStore["store_type"] = "pharmacy";
  if (
    taxonomyDesc.includes("Community/Retail") ||
    taxonomyDesc === "Pharmacy"
  ) {
    storeType = "pharmacy";
  }

  return {
    id: `npi/${result.number}`,
    name,
    brand: null,
    address: loc.address_1,
    city: loc.city,
    state: loc.state,
    zip: zip5 || null,
    phone: loc.telephone_number ? formatPhone(loc.telephone_number) : null,
    hours: null,
    website: null,
    store_type: storeType,
    source: "nppes",
    otc_tier: "likely",
    latitude: coords.lat,
    longitude: coords.lon,
    distance_miles: haversineMiles(originLat, originLon, coords.lat, coords.lon),
  };
}

export async function fetchNpiPharmacies(
  context: PharmacyFetchContext,
  zips: string[],
  originZip: string
): Promise<OtcStore[]> {
  const seenNpi = new Set<string>();
  const pending: { result: NpiResult; loc: NpiAddress }[] = [];
  const geocodeCache = new Map<string, { lat: number; lon: number } | null>();
  const geocodeBudget = { remaining: MAX_NPI_GEOCODES_PER_SEARCH };

  const queueResult = (results: NpiResult[]) => {
    for (const result of results) {
      if (seenNpi.has(result.number)) continue;
      seenNpi.add(result.number);

      if (result.enumeration_type === "NPI-1") continue;

      const loc =
        result.addresses.find((a) => a.address_purpose === "LOCATION") ??
        result.addresses[0];
      if (!loc) continue;

      const name = result.basic.organization_name?.trim();
      if (!name) continue;

      pending.push({ result, loc });
    }
  };

  const primaryFetches = zips.map((zip) => fetchNpiForZip(zip, "Pharmacy"));
  const primaryResults = await Promise.all(primaryFetches);
  for (const batch of primaryResults) queueResult(batch);

  const extraTaxonomies = NPI_TAXONOMY_DESCRIPTIONS.filter((t) => t !== "Pharmacy");
  const extraFetches = extraTaxonomies.map((taxonomy) =>
    fetchNpiForZip(originZip, taxonomy)
  );
  const extraResults = await Promise.all(extraFetches);
  for (const batch of extraResults) queueResult(batch);

  const coordsList = await mapWithConcurrency(
    pending,
    GEOCODE_CONCURRENCY,
    ({ loc }) =>
      resolveNpiCoordinates(
        loc,
        context.zipCoords,
        geocodeCache,
        geocodeBudget
      )
  );

  const stores: OtcStore[] = [];
  for (let i = 0; i < pending.length; i++) {
    const coords = coordsList[i];
    if (!coords) continue;

    const store = parseNpiPharmacy(
      pending[i].result,
      context.originLat,
      context.originLon,
      coords
    );
    if (!store) continue;
    if (store.distance_miles > context.radiusMiles) continue;
    stores.push(store);
  }

  return stores;
}
