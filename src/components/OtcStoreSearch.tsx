"use client";

import { useState, useCallback, useMemo } from "react";
import type { PharmacySearchResponse } from "@/lib/pharmacy-types";
import { matchesNameOrAddress } from "@/lib/filter-by-query";
import { useLanguage } from "@/lib/i18n/context";
import { OtcStoreCard } from "./OtcStoreCard";
import { PharmacyResourceLinks } from "./PharmacyResourceLinks";
import {
  LocationSearchForm,
  buildLocationSearchParams,
  type LocationSearchParams,
} from "./LocationSearchForm";
import { ResultsFilterBar } from "./ResultsFilterBar";

const RADIUS_OPTIONS = [5, 10, 15, 25];

export function OtcStoreSearch() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PharmacySearchResponse | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  const search = useCallback(
    async (params: LocationSearchParams) => {
      setLoading(true);
      setError(null);
      setFilterQuery("");

      try {
        const query = buildLocationSearchParams(params);
        const res = await fetch(`/api/pharmacies/search?${query}`);
        let data: PharmacySearchResponse & { error?: string };
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

  const filteredStores = useMemo(() => {
    if (!results) return [];
    return results.stores.filter((store) =>
      matchesNameOrAddress(filterQuery, [
        store.name,
        store.brand,
        store.address,
        store.city,
        store.state,
        store.zip,
      ])
    );
  }, [results, filterQuery]);

  const locationLabel =
    results?.search_label ??
    (results?.city && results?.state
      ? `${results.city}, ${results.state}${results.zip ? ` ${results.zip}` : ""}`
      : results?.zip ?? "");

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{t("store.locationsNote")}</p>

      <LocationSearchForm
        idPrefix="store"
        radiusOptions={RADIUS_OPTIONS}
        defaultRadius={10}
        formLabel={t("store.formLabel")}
        submitLabel={t("store.find")}
        searchingLabel={t("store.searching")}
        accentClass="bg-violet-700 hover:bg-violet-800"
        onSearch={search}
        loading={loading}
        error={error}
      />

      {results && (
        <div className="space-y-6">
          <ResultsFilterBar
            id="store-filter"
            value={filterQuery}
            onChange={setFilterQuery}
            filteredCount={filteredStores.length}
            totalCount={results.total}
          />

          <div>
            <h3 className="text-xl font-bold">
              {t("store.found", {
                count: filterQuery.trim() ? filteredStores.length : results.total,
              })}
            </h3>
            <p className="text-muted mt-1 text-sm">
              {t("store.within", {
                radius: results.radius_miles,
                location: locationLabel,
              })}
            </p>
            {results.disclaimer && (
              <p className="text-xs text-muted mt-2">{results.disclaimer}</p>
            )}
            {results.sources?.length > 0 && (
              <p className="text-xs text-muted mt-1">
                {t("store.sourcesLabel", { sources: results.sources.join(", ") })}
              </p>
            )}
          </div>

          {results.total === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-amber-900 font-medium">{t("store.noResults")}</p>
              <p className="text-amber-800 text-sm mt-2">{t("store.noResultsHint")}</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-amber-900 font-medium">{t("search.filterNoMatch")}</p>
            </div>
          ) : (
            <ul className="space-y-4" aria-label="Pharmacy results">
              {filteredStores.map((store) => (
                <li key={store.id}>
                  <OtcStoreCard store={store} />
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted">{t("store.source")}</p>

          {results.external_resources?.length > 0 && (
            <PharmacyResourceLinks resources={results.external_resources} />
          )}
        </div>
      )}
    </div>
  );
}
