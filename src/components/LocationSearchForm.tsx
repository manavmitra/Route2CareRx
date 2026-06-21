"use client";

import { useState, useCallback, FormEvent } from "react";
import { useLanguage } from "@/lib/i18n/context";

export type SearchMode = "zip" | "address" | "location";

export interface LocationSearchParams {
  mode: SearchMode;
  radius: number;
  zip?: string;
  address?: string;
  lat?: number;
  lng?: number;
  name?: string;
}

interface LocationSearchFormProps {
  idPrefix: string;
  radiusOptions: number[];
  defaultRadius: number;
  formLabel: string;
  submitLabel: string;
  searchingLabel: string;
  addressOrNamePlaceholder: string;
  accentClass?: string;
  onSearch: (params: LocationSearchParams) => void;
  loading: boolean;
  error: string | null;
}

function looksLikeNameOnly(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  return !/\d/.test(trimmed) && !trimmed.includes(",");
}

export function buildLocationSearchParams(
  params: LocationSearchParams
): URLSearchParams {
  const search = new URLSearchParams({
    radius: String(params.radius),
  });
  if (params.mode === "zip" && params.zip) {
    search.set("zip", params.zip);
  } else if (params.mode === "address" && params.address) {
    search.set("address", params.address);
  } else   if (params.mode === "location" && params.lat != null && params.lng != null) {
    search.set("lat", String(params.lat));
    search.set("lng", String(params.lng));
  }
  return search;
}

export function LocationSearchForm({
  idPrefix,
  radiusOptions,
  defaultRadius,
  formLabel,
  submitLabel,
  searchingLabel,
  addressOrNamePlaceholder,
  accentClass = "bg-primary hover:bg-primary-dark",
  onSearch,
  loading,
  error,
}: LocationSearchFormProps) {
  const { t, translateError } = useLanguage();
  const [mode, setMode] = useState<SearchMode>("zip");
  const [zip, setZip] = useState("");
  const [addressOrName, setAddressOrName] = useState("");
  const [radius, setRadius] = useState(defaultRadius);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locating, setLocating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError ?? error;

  const requestLocation = useCallback(() => {
    setLocalError(null);
    if (!navigator.geolocation) {
      setLocalError(t("search.geoUnsupported"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocalError(t("search.geoDenied"));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [t]);

  function handleModeChange(next: SearchMode) {
    setMode(next);
    setLocalError(null);
    if (next === "location" && !coords) {
      requestLocation();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (mode === "zip") {
      const cleaned = zip.replace(/\D/g, "").slice(0, 5);
      if (cleaned.length !== 5) {
        setLocalError(t("errors.invalidZip"));
        return;
      }
      onSearch({ mode: "zip", zip: cleaned, radius });
      return;
    }

    if (mode === "address") {
      const trimmed = addressOrName.trim();
      if (trimmed.length < 2) {
        setLocalError(t("search.addressOrNameRequired"));
        return;
      }
      onSearch({
        mode: "address",
        address: trimmed,
        radius,
        name: looksLikeNameOnly(trimmed) ? trimmed : undefined,
      });
      return;
    }

    if (!coords) {
      setLocalError(t("search.locationRequired"));
      return;
    }
    onSearch({
      mode: "location",
      lat: coords.lat,
      lng: coords.lng,
      radius,
    });
  }

  const canSubmit =
    !loading &&
    !locating &&
    (mode === "zip"
      ? zip.length >= 5
      : mode === "address"
        ? addressOrName.trim().length >= 2
        : coords !== null);

  const modeOptions: { value: SearchMode; labelKey: string }[] = [
    { value: "zip", labelKey: "search.modeZip" },
    { value: "address", labelKey: "search.modeAddress" },
    { value: "location", labelKey: "search.modeLocation" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8"
      aria-label={formLabel}
    >
      <fieldset className="mb-4">
        <legend className="block text-sm font-medium mb-2">
          {t("search.modeLabel")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {modeOptions.map(({ value, labelKey }) => (
            <label
              key={value}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors text-sm font-medium ${
                mode === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name={`${idPrefix}-search-mode`}
                value={value}
                checked={mode === value}
                onChange={() => handleModeChange(value)}
                className="sr-only"
              />
              {t(labelKey)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          {mode === "zip" && (
            <>
              <label htmlFor={`${idPrefix}-zip`} className="block text-sm font-medium mb-2">
                {t("search.zipLabel")}
              </label>
              <input
                id={`${idPrefix}-zip`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                placeholder={t("search.zipPlaceholder")}
                value={zip}
                onChange={(e) => {
                  setZip(e.target.value.replace(/\D/g, "").slice(0, 5));
                  setLocalError(null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                aria-describedby={`${idPrefix}-zip-hint`}
              />
            </>
          )}

          {mode === "address" && (
            <>
              <label htmlFor={`${idPrefix}-address`} className="block text-sm font-medium mb-2">
                {t("search.addressOrNameLabel")}
              </label>
              <input
                id={`${idPrefix}-address`}
                type="search"
                autoComplete="street-address"
                placeholder={addressOrNamePlaceholder}
                value={addressOrName}
                onChange={(e) => {
                  setAddressOrName(e.target.value);
                  setLocalError(null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                aria-describedby={`${idPrefix}-address-hint`}
              />
            </>
          )}

          {mode === "location" && (
            <>
              <p className="block text-sm font-medium mb-2">
                {t("search.locationLabel")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={locating}
                  className="px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted/30 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {locating ? t("search.locating") : t("search.useMyLocation")}
                </button>
                {coords && (
                  <p className="text-sm text-muted self-center">
                    {t("search.locationDetected")}
                  </p>
                )}
              </div>
            </>
          )}

        </div>

        <div className="sm:w-40 shrink-0">
          <label htmlFor={`${idPrefix}-radius`} className="block text-sm font-medium mb-2">
            {t("search.radiusLabel")}
          </label>
          <select
            id={`${idPrefix}-radius`}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            {radiusOptions.map((r) => (
              <option key={r} value={r}>
                {t("search.radiusMiles", { n: r })}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:w-auto shrink-0">
          <span
            className="block text-sm font-medium mb-2 invisible select-none"
            aria-hidden="true"
          >
            &nbsp;
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg transition-colors cursor-pointer whitespace-nowrap ${accentClass}`}
          >
            {loading ? searchingLabel : submitLabel}
          </button>
        </div>
      </div>

      {mode === "zip" && (
        <p id={`${idPrefix}-zip-hint`} className="mt-1.5 text-sm text-muted">
          {t("search.zipHint")}
        </p>
      )}
      {mode === "address" && (
        <p id={`${idPrefix}-address-hint`} className="mt-1.5 text-sm text-muted">
          {t("search.addressHint")}
        </p>
      )}
      {mode === "location" && (
        <p className="mt-1.5 text-sm text-muted">{t("search.locationHint")}</p>
      )}

      {displayError && (
        <div
          role="alert"
          className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          {localError ? displayError : translateError(displayError)}
        </div>
      )}
    </form>
  );
}
