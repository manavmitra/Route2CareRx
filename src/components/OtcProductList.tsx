"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import type { OtcMedication, OtcProductSearchResponse } from "@/lib/otc-types";

interface OtcProductListProps {
  medication: OtcMedication;
  embedded?: boolean;
}

export function OtcProductList({ medication, embedded = false }: OtcProductListProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(embedded);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OtcProductSearchResponse | null>(null);

  const substance = medication.substanceName ?? medication.name;
  const isOpen = embedded || expanded;

  useEffect(() => {
    if (!isOpen) {
      if (!embedded) {
        setData(null);
        setError(null);
        setLoading(false);
      }
      return;
    }

    if (data) return;

    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/otc/products?substance=${encodeURIComponent(substance)}&limit=12`
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
  }, [isOpen, data, substance, embedded]);

  if (!embedded) {
    return (
      <div className="mt-5 pt-5 border-t border-border">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-accent hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? t("otc.hideProducts") : t("otc.showProducts")}
        </button>
        {expanded && (
          <ProductTable
            loading={loading}
            error={error}
            data={data}
            substance={substance}
          />
        )}
      </div>
    );
  }

  return (
    <ProductTable loading={loading} error={error} data={data} substance={substance} />
  );
}

function ProductTable({
  loading,
  error,
  data,
  substance,
}: {
  loading: boolean;
  error: string | null;
  data: OtcProductSearchResponse | null;
  substance: string;
}) {
  const { t } = useLanguage();

  if (loading) {
    return <p className="text-sm text-muted">{t("otc.loadingProducts")}</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-700" role="alert">
        {error}
      </p>
    );
  }

  if (!data) return null;

  return (
    <>
      <p className="text-xs text-muted">
        {t("otc.productCount", {
          shown: data.products.length,
          total: data.total.toLocaleString(),
          substance,
        })}
      </p>
      {data.products.length === 0 ? (
        <p className="text-sm text-muted">{t("otc.noProducts")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-2.5 font-semibold">{t("otc.productColumn")}</th>
                <th className="text-left p-2.5 font-semibold hidden sm:table-cell">
                  {t("otc.formColumn")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.ndc} className="border-t border-border align-top">
                  <td className="p-2.5">
                    <span className="font-medium">{p.brandName ?? p.genericName}</span>
                    {p.brandName && (
                      <p className="text-muted text-xs mt-0.5">{p.genericName}</p>
                    )}
                  </td>
                  <td className="p-2.5 text-muted hidden sm:table-cell">
                    {[p.dosageForm, p.strength].filter(Boolean).join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
