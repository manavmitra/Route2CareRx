"use client";

import { useState } from "react";
import { ClinicSearch } from "@/components/ClinicSearch";
import { PageHero } from "@/components/PageHero";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { useLanguage } from "@/lib/i18n/context";
import type { SearchResponse } from "@/lib/types";

export function ClinicsDisclaimer() {
  const { t } = useLanguage();

  return (
    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
      <strong>{t("clinics.disclaimerLead")}</strong> {t("clinics.disclaimerBody")}
    </div>
  );
}

function buildHeroSubtitle(
  results: SearchResponse | null,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  if (!results) return t("clinics.heroSubtitleDefault");

  const location =
    results.zip ??
    results.search_label ??
    (results.city && results.state
      ? `${results.city}, ${results.state}`
      : "");

  return t("clinics.heroSubtitleResults", {
    location,
    radius: results.radius_miles,
  });
}

export function ClinicsPageMain() {
  const { t } = useLanguage();
  const [results, setResults] = useState<SearchResponse | null>(null);

  return (
    <>
      <PageHero
        variant="clinics"
        badge={t("clinics.eyebrow")}
        title={t("clinics.heroTitle")}
        subtitle={buildHeroSubtitle(results, t)}
        rounded
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 pb-4 w-full">
        <ClinicsDisclaimer />
        <ClinicSearch onResultsChange={setResults} />
        <PrivacyFooter />
      </main>
    </>
  );
}
