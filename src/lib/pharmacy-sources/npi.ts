import type { OtcStore } from "@/lib/pharmacy-types";
import { haversineMiles, formatPhone } from "@/lib/utils";
import type { PharmacyFetchContext } from "./types";

const NPI_URL = "https://npiregistry.cms.hhs.gov/api/";

/** NPI taxonomy descriptions for traditional retail pharmacies only. */
const NPI_TAXONOMY_DESCRIPTIONS = [
  "Pharmacy",
  "Community/Retail Pharmacy",
] as const;

const NON_RETAIL_TAXONOMY = /clinic|mail order|institutional|compounding/i;

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

function parseNpiPharmacy(
  result: NpiResult,
  originLat: number,
  originLon: number,
  zipCoords: Map<string, { lat: number; lon: number }>
): OtcStore | null {
  const loc =
    result.addresses.find((a) => a.address_purpose === "LOCATION") ??
    result.addresses[0];
  if (!loc) return null;

  const name =
    result.basic.organization_name ??
    [result.basic.first_name, result.basic.last_name].filter(Boolean).join(" ");

  if (!name) return null;

  const zip5 = (loc.postal_code ?? "").replace(/\D/g, "").slice(0, 5);
  const coords = zip5 ? zipCoords.get(zip5) : null;
  const lat = coords?.lat ?? originLat;
  const lon = coords?.lon ?? originLon;

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
    latitude: lat,
    longitude: lon,
    distance_miles: haversineMiles(originLat, originLon, lat, lon),
  };
}

export async function fetchNpiPharmacies(
  context: PharmacyFetchContext,
  zips: string[],
  originZip: string
): Promise<OtcStore[]> {
  const seenNpi = new Set<string>();
  const stores: OtcStore[] = [];

  const addResults = (results: NpiResult[]) => {
    for (const result of results) {
      if (seenNpi.has(result.number)) continue;
      seenNpi.add(result.number);

      const store = parseNpiPharmacy(
        result,
        context.originLat,
        context.originLon,
        context.zipCoords
      );
      if (!store) continue;
      if (store.distance_miles > context.radiusMiles) continue;
      stores.push(store);
    }
  };

  const primaryFetches = zips.map((zip) => fetchNpiForZip(zip, "Pharmacy"));
  const primaryResults = await Promise.all(primaryFetches);
  for (const batch of primaryResults) addResults(batch);

  const extraTaxonomies = NPI_TAXONOMY_DESCRIPTIONS.filter((t) => t !== "Pharmacy");
  const extraFetches = extraTaxonomies.map((taxonomy) =>
    fetchNpiForZip(originZip, taxonomy)
  );
  const extraResults = await Promise.all(extraFetches);
  for (const batch of extraResults) addResults(batch);

  return stores;
}
