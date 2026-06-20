import { NextRequest, NextResponse } from "next/server";

interface RxNormResponse {
  idGroup?: {
    rxnormId?: string[];
    name?: string;
  };
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.trim();
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "A drug name is required." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}&search=2`,
      { next: { revalidate: 604800 } }
    );

    if (!res.ok) {
      return NextResponse.json({ name, rxcui: null, rxnormUrl: null });
    }

    const data = (await res.json()) as RxNormResponse;
    const rxcui = data.idGroup?.rxnormId?.[0] ?? null;

    return NextResponse.json({
      name: data.idGroup?.name ?? name,
      rxcui,
      rxnormUrl: rxcui
        ? `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${rxcui}`
        : `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${encodeURIComponent(name)}`,
      dailymedUrl: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(name)}`,
    });
  } catch (err) {
    console.error("RxNorm lookup error:", err);
    return NextResponse.json(
      { error: "Unable to look up RxNorm identifier." },
      { status: 500 }
    );
  }
}
