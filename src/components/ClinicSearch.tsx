"use client";

import { useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import type { SearchResponse } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";
import { ClinicCard } from "./ClinicCard";

const RADIUS_OPTIONS = [10, 25, 50, 100];

export function ClinicSearch() {
  const { t, translateError } = useLanguage();
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);

  const search = useCallback(
    async (searchZip: string, searchRadius: number) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          zip: searchZip,
          radius: String(searchRadius),
        });
        const res = await fetch(`/api/clinics/search?${params}`);
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = zip.replace(/\D/g, "").slice(0, 5);
    if (cleaned.length !== 5) {
      setError(t("errors.invalidZip"));
      return;
    }
    search(cleaned, radius);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8"
        aria-label={t("search.formLabel")}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="zip" className="block text-sm font-medium mb-2">
              {t("search.zipLabel")}
            </label>
            <input
              id="zip"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              placeholder={t("search.zipPlaceholder")}
              value={zip}
              onChange={(e) => {
                setZip(e.target.value.replace(/\D/g, "").slice(0, 5));
                setError(null);
              }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              aria-describedby="zip-hint"
              aria-invalid={error ? "true" : undefined}
              required
            />
            <p id="zip-hint" className="mt-1.5 text-sm text-muted">
              {t("search.zipHint")}
            </p>
          </div>

          <div className="sm:w-40">
            <label htmlFor="radius" className="block text-sm font-medium mb-2">
              {t("search.radiusLabel")}
            </label>
            <select
              id="radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {t("search.radiusMiles", { n: r })}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:self-end">
            <button
              type="submit"
              disabled={loading || zip.length < 5}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg transition-colors cursor-pointer"
            >
              {loading ? t("search.searching") : t("search.submit")}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
          >
            {translateError(error)}
          </div>
        )}
      </form>

      {results && (
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {t("search.results", { count: results.total })}
            </h2>
            <p className="text-muted mt-1">
              {t("search.within", {
                radius: results.radius_miles,
                location: `${results.city ? `${results.city}, ${results.state} ` : ""}${results.zip}`,
              })}
            </p>
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
          ) : (
            <ul className="space-y-4" aria-label="Clinic results">
              {results.clinics.map((clinic) => (
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
