"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import type { Clinic, SearchResponse } from "@/lib/types";
import { matchesNameOrAddress } from "@/lib/filter-by-query";
import { useLanguage } from "@/lib/i18n/context";
import { ClinicCard } from "./ClinicCard";
import {
  LocationSearchForm,
  buildLocationSearchParams,
  type LocationSearchParams,
} from "./LocationSearchForm";

const RADIUS_OPTIONS = [10, 25, 50, 100];

type ClinicFilter = "womens_health" | "sliding_fee" | "has_hours";
type SortOption = "distance" | "name";

interface ClinicSearchProps {
  onResultsChange?: (results: SearchResponse | null) => void;
}

function matchesWomensHealth(clinic: Clinic): boolean {
  const text = [...clinic.services, clinic.name, clinic.organization_name ?? ""].join(" ");
  return /women|reproductive|obgyn|prenatal|gynecol/i.test(text);
}

export function ClinicSearch({ onResultsChange }: ClinicSearchProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<ClinicFilter>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [showSearchForm, setShowSearchForm] = useState(true);

  const toggleFilter = (filter: ClinicFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const search = useCallback(
    async (params: LocationSearchParams) => {
      setLoading(true);
      setError(null);
      setFilterQuery(params.name?.trim() ?? "");
      setShowSearchForm(false);

      try {
        const query = buildLocationSearchParams(params);
        const res = await fetch(`/api/clinics/search?${query}`);
        let data: SearchResponse & { error?: string };
        try {
          data = await res.json();
        } catch {
          setResults(null);
          onResultsChange?.(null);
          setError(t("errors.generic"));
          return;
        }

        if (!res.ok) {
          setResults(null);
          onResultsChange?.(null);
          setError(data.error ?? t("errors.generic"));
          return;
        }

        setResults(data);
        onResultsChange?.(data);
      } catch {
        setResults(null);
        onResultsChange?.(null);
        setError(t("errors.network"));
      } finally {
        setLoading(false);
      }
    },
    [t, onResultsChange]
  );

  const filteredClinics = useMemo(() => {
    if (!results) return [];

    let list = results.clinics.filter((clinic) =>
      matchesNameOrAddress(filterQuery, [
        clinic.name,
        clinic.organization_name,
        clinic.address,
        clinic.city,
        clinic.state,
        clinic.zip,
      ])
    );

    if (activeFilters.has("womens_health")) {
      list = list.filter(matchesWomensHealth);
    }
    if (activeFilters.has("sliding_fee")) {
      list = list.filter(
        (c) => c.cost_level === "sliding_scale" || c.cost_level === "free"
      );
    }
    if (activeFilters.has("has_hours")) {
      list = list.filter((c) => (c.hours_of_operation ?? []).length > 0);
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (a.distance_miles ?? 999) - (b.distance_miles ?? 999);
    });

    return list;
  }, [results, filterQuery, activeFilters, sortBy]);

  const filterChips: { id: ClinicFilter; label: string }[] = [
    { id: "womens_health", label: t("filter.womensHealth") },
    { id: "has_hours", label: t("filter.hasHours") },
    { id: "sliding_fee", label: t("filter.slidingFee") },
  ];

  return (
    <div className="w-full">
      {(showSearchForm || !results) && (
        <LocationSearchForm
          idPrefix="clinic"
          radiusOptions={RADIUS_OPTIONS}
          defaultRadius={25}
          formLabel={t("search.formLabel")}
          submitLabel={t("search.submit")}
          searchingLabel={t("search.searching")}
          addressOrNamePlaceholder={t("search.clinicAddressOrNamePlaceholder")}
          onSearch={search}
          loading={loading}
          error={error}
        />
      )}

      {results && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSearchForm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              ☰ {t("filter.filters")}
            </button>
            {filterChips.map(({ id, label }) => {
              const active = activeFilters.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleFilter(id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-teal-100 text-primary-dark border border-teal-200"
                      : "bg-card border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                  {active && <span aria-hidden>×</span>}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="font-medium">
              {t("search.results", { count: filteredClinics.length })}
            </p>
            <label className="flex items-center gap-2 text-muted">
              {t("filter.sortBy")}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-border bg-card px-2 py-1 text-foreground text-sm"
              >
                <option value="distance">{t("filter.sortDistance")}</option>
                <option value="name">{t("filter.sortName")}</option>
              </select>
            </label>
          </div>

          {results.total === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-amber-900 font-medium">{t("search.noResults")}</p>
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
