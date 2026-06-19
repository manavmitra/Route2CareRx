"use client";

import { useState, useCallback, FormEvent } from "react";
import type { PharmacySearchResponse } from "@/lib/pharmacy-types";
import { useLanguage } from "@/lib/i18n/context";
import { OtcStoreCard } from "./OtcStoreCard";

const RADIUS_OPTIONS = [5, 10, 15, 25];

export function OtcStoreSearch() {
  const { t, translateError } = useLanguage();
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PharmacySearchResponse | null>(null);

  const search = useCallback(
    async (searchZip: string, searchRadius: number) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          zip: searchZip,
          radius: String(searchRadius),
        });
      const res = await fetch(`/api/pharmacies/search?${params}`);
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
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8"
        aria-label={t("store.formLabel")}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="store-zip" className="block text-sm font-medium mb-2">
              {t("search.zipLabel")}
            </label>
            <input
              id="store-zip"
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
              required
            />
          </div>

          <div className="sm:w-40">
            <label htmlFor="store-radius" className="block text-sm font-medium mb-2">
              {t("search.radiusLabel")}
            </label>
            <select
              id="store-radius"
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
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-violet-700 hover:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg transition-colors cursor-pointer"
            >
              {loading ? t("store.searching") : t("store.find")}
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
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold">
              {t("store.found", { count: results.total })}
            </h3>
            <p className="text-muted mt-1 text-sm">
              {t("store.within", {
                radius: results.radius_miles,
                location: `${results.city ? `${results.city}, ${results.state} ` : ""}${results.zip}`,
              })}
            </p>
            {results.disclaimer && (
              <p className="text-xs text-muted mt-2">{results.disclaimer}</p>
            )}
          </div>

          {results.total === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-amber-900 font-medium">{t("store.noResults")}</p>
              <p className="text-amber-800 text-sm mt-2">{t("store.noResultsHint")}</p>
            </div>
          ) : (
            <ul className="space-y-4" aria-label="Pharmacy results">
              {results.stores.map((store) => (
                <li key={store.id}>
                  <OtcStoreCard store={store} />
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted">{t("store.source")}</p>
        </div>
      )}
    </div>
  );
}
