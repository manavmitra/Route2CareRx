import { NextRequest, NextResponse } from "next/server";
import type { OtcProduct, OtcProductSearchResponse } from "@/lib/otc-types";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const EXCLUDED_CATEGORIES = new Set([
  "BULK INGREDIENT",
  "DRUG FOR FURTHER PROCESSING",
  "API",
]);

interface NdcResult {
  product_ndc: string;
  brand_name?: string;
  brand_name_base?: string;
  generic_name: string;
  labeler_name: string;
  dosage_form?: string;
  route?: string[];
  marketing_category?: string;
  finished?: boolean;
  active_ingredients: { name: string; strength: string }[];
  packaging?: { description: string }[];
}

function parseProduct(result: NdcResult, substance: string): OtcProduct | null {
  if (!result.finished) return null;
  if (result.marketing_category && EXCLUDED_CATEGORIES.has(result.marketing_category)) {
    return null;
  }

  const match = result.active_ingredients.find(
    (a) => a.name.toUpperCase() === substance.toUpperCase()
  );
  if (!match) return null;

  const strength = result.active_ingredients
    .map((a) => `${a.name} ${a.strength}`)
    .join("; ");

  return {
    ndc: result.product_ndc,
    brandName: result.brand_name ?? result.brand_name_base ?? null,
    genericName: result.generic_name,
    dosageForm: result.dosage_form ?? null,
    route: result.route?.join(", ") ?? null,
    strength,
    manufacturer: result.labeler_name,
    marketingCategory: result.marketing_category ?? null,
    packageDescription: result.packaging?.[0]?.description ?? null,
  };
}

export async function GET(request: NextRequest) {
  const substance = request.nextUrl.searchParams.get("substance")?.trim();
  const limitParam = request.nextUrl.searchParams.get("limit");

  if (!substance || substance.length < 2) {
    return NextResponse.json(
      { error: "A substance or active ingredient name is required." },
      { status: 400 }
    );
  }

  const limit = Math.min(
    Math.max(Number(limitParam) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const search = encodeURIComponent(
    `active_ingredients.name:"${substance.toUpperCase()}" AND finished:true`
  );

  try {
    const res = await fetch(
      `https://api.fda.gov/drug/ndc.json?search=${search}&limit=${limit * 3}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({
          substance,
          total: 0,
          products: [],
          source: "openFDA NDC Directory",
        } satisfies OtcProductSearchResponse);
      }
      return NextResponse.json(
        { error: "Unable to fetch product data from openFDA." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      meta?: { results?: { total?: number } };
      results?: NdcResult[];
    };

    const seen = new Set<string>();
    const products: OtcProduct[] = [];

    for (const result of data.results ?? []) {
      const product = parseProduct(result, substance);
      if (!product || seen.has(product.ndc)) continue;
      seen.add(product.ndc);
      products.push(product);
      if (products.length >= limit) break;
    }

    return NextResponse.json({
      substance,
      total: data.meta?.results?.total ?? products.length,
      products,
      source: "openFDA NDC Directory",
    } satisfies OtcProductSearchResponse);
  } catch (err) {
    console.error("OTC product search error:", err);
    return NextResponse.json(
      { error: "Unable to fetch products. Please try again." },
      { status: 500 }
    );
  }
}
