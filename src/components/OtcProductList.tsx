"use client";

import { useEffect, useState } from "react";
import type { OtcMedication, OtcProductSearchResponse } from "@/lib/otc-types";

interface OtcProductListProps {
  medication: OtcMedication;
}

export function OtcProductList({ medication }: OtcProductListProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OtcProductSearchResponse | null>(null);

  const substance = medication.substanceName ?? medication.name;

  useEffect(() => {
    if (!expanded) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (data) return;

    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/otc/products?substance=${encodeURIComponent(substance)}&limit=20`
        );
        const json = (await res.json()) as OtcProductSearchResponse & {
          error?: string;
        };

        if (cancelled) return;

        if (!res.ok) {
          setError(json.error ?? "Failed to load products");
          return;
        }

        setData(json);
      } catch {
        if (!cancelled) {
          setError("Failed to load products. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [expanded, data, substance]);

  return (
    <div className="mt-5 pt-5 border-t border-border">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-sm font-medium text-accent hover:underline"
        aria-expanded={expanded}
      >
        {expanded ? "Hide" : "View"} brand &amp; generic products (NDC listings)
      </button>

      {expanded && (
        <div className="mt-4">
          {loading && (
            <p className="text-sm text-muted">Loading FDA product listings…</p>
          )}
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          {data && (
            <>
              <p className="text-xs text-muted mb-3">
                {data.total.toLocaleString()} NDC product
                {data.total !== 1 ? "s" : ""} listed for {data.substance} in the{" "}
                {data.source}. Showing up to {data.products.length}.
              </p>
              {data.products.length === 0 ? (
                <p className="text-sm text-muted">
                  No finished consumer products found for this ingredient in openFDA.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 font-semibold">Product</th>
                        <th className="text-left p-3 font-semibold hidden sm:table-cell">
                          Form / strength
                        </th>
                        <th className="text-left p-3 font-semibold hidden md:table-cell">
                          Manufacturer
                        </th>
                        <th className="text-left p-3 font-semibold">NDC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.map((p) => (
                        <tr key={p.ndc} className="border-t border-border align-top">
                          <td className="p-3">
                            <span className="font-medium">
                              {p.brandName ?? p.genericName}
                            </span>
                            {p.brandName && (
                              <p className="text-muted text-xs mt-0.5">
                                {p.genericName}
                              </p>
                            )}
                          </td>
                          <td className="p-3 text-muted hidden sm:table-cell">
                            {[p.dosageForm, p.strength].filter(Boolean).join(" · ")}
                          </td>
                          <td className="p-3 text-muted hidden md:table-cell">
                            {p.manufacturer}
                          </td>
                          <td className="p-3 text-muted font-mono text-xs">{p.ndc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
