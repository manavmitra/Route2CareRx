"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import type { SearchResponse } from "@/lib/types";
import { matchesNameOrAddress } from "@/lib/filter-by-query";
import { useLanguage } from "@/lib/i18n/context";
import { ClinicCard } from "./ClinicCard";
import {
  LocationSearchForm,
  buildLocationSearchParams,
  type LocationSearchParams,
} from "./LocationSearchForm";
import { ResultsFilterBar } from "./ResultsFilterBar";

const RADIUS_OPTIONS = [10, 25, 50, 100];

export function ClinicSearch() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  const search = useCallback(
    async (params: LocationSearchParams) => {
      setLoading(true);
      setError(null);
      setFilterQuery("");

      try {
        const query = buildLocationSearchParams(params);
        const res = await fetch(`/api/clinics/search?${query}`);
        let data: SearchResponse & { error?: string };
        try {
          data = await res.json();
        } catch {
          setResults(null);
          setError(t("errors.generic"));
          return;
        }

        if (!res.ok) {
          setResults(null);
          setError(data.error ?? t("errors.generic"));
          return;
        }

        setResults(data);
      } catch {
        setResults(null);
        setError(t("errors.network"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const filteredClinics = useMemo(() => {
    if (!results) return [];
    return results.clinics.filter((clinic) =>
      matchesNameOrAddress(filterQuery, [
        clinic.name,
        clinic.organization_name,
        clinic.address,
        clinic.city,
        clinic.state,
        clinic.zip,
      ])
    );
  }, [results, filterQuery]);

  const locationLabel =
    results?.search_label ??
    (results?.city && results?.state
      ? `${results.city}, ${results.state}${results.zip ? ` ${results.zip}` : ""}`
      : results?.zip ?? "");

  return (
    <div className="w-full max-w-4xl mx-auto">
      <LocationSearchForm
        idPrefix="clinic"
        radiusOptions={RADIUS_OPTIONS}
        defaultRadius={25}
        formLabel={t("search.formLabel")}
        submitLabel={t("search.submit")}
        searchingLabel={t("search.searching")}
        onSearch={search}
        loading={loading}
        error={error}
      />

      {results && (
        <div className="mt-8 space-y-6">
          <ResultsFilterBar
            id="clinic-filter"
            value={filterQuery}
            onChange={setFilterQuery}
            filteredCount={filteredClinics.length}
            totalCount={results.total}
          />

          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {t("search.results", {
                count: filterQuery.trim() ? filteredClinics.length : results.total,
              })}
            </h2>
            <p className="text-muted mt-1">
              {t("search.within", {
                radius: results.radius_miles,
                location: locationLabel,
              })}
            </p>
          </div>

          {results.total === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-amber-900 font-medium">
                {t("search.noResults")}
              </p>
              <p className="text-amber-800 text-sm mt-2">
                {t("search.noResultsHintPrefix")}{" "}
                <Link href="/resources" className="font-medium underline">
                  {t("search.additionalResources")}
                </Link>{" "}
                {t("search.noResultsHintSuffix")}
              </p>
            </div>
          ) : filteredClinics.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-amber-900 font-medium">{t("search.filterNoMatch")}</p>
            </div>
          ) : (
            <ul className="space-y-4" aria-label="Clinic results">
              {filteredClinics.map((clinic) => (
                <li key={clinic.id}>
                  <ClinicCard clinic={clinic} />
                </li>
              ))}
            </ul>
          )}

          {results.total > 0 && (
            <p className="text-center text-sm text-muted">
              {t("search.moreOptions")}{" "}
              <Link href="/resources" className="text-accent hover:underline font-medium">
                {t("search.browseResources")}
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
