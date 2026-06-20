"use client";

import type { OtcStore } from "@/lib/pharmacy-types";
import { useLanguage } from "@/lib/i18n/context";
import { formatDistance, formatPhone } from "@/lib/utils";

interface OtcStoreCardProps {
  store: OtcStore;
}

function storeTypeKey(type: OtcStore["store_type"]): string {
  return `store.type.${type}`;
}

function sourceKey(source: OtcStore["source"]): string {
  return `store.source.${source}`;
}

export function OtcStoreCard({ store }: OtcStoreCardProps) {
  const { t } = useLanguage();
  const phone = formatPhone(store.phone);
  const mapsQuery = encodeURIComponent(
    [store.name, store.address, store.city, store.state, store.zip]
      .filter(Boolean)
      .join(", ")
  );

  return (
    <article className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold leading-tight">{store.name}</h3>
          {store.brand && store.brand !== store.name && (
            <p className="text-sm text-muted mt-0.5">{store.brand}</p>
          )}
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-50 text-violet-800 text-sm font-medium whitespace-nowrap">
          {formatDistance(store.distance_miles)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 text-violet-800 text-xs font-medium">
          {t(storeTypeKey(store.store_type))}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
          {t(sourceKey(store.source))}
        </span>
      </div>

      {(store.address || store.city) && (
        <p className="mt-4 text-sm text-muted leading-relaxed">
          {[store.address, store.city, store.state, store.zip]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}

      {store.hours && (
        <p className="mt-2 text-sm">
          <span className="font-medium">{t("card.hours")}</span>{" "}
          <span className="text-muted">{store.hours}</span>
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {phone && (
          <a
            href={`tel:${store.phone?.replace(/\D/g, "")}`}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            {t("store.call", { phone })}
          </a>
        )}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          {t("card.directions")}
        </a>
      </div>
    </article>
  );
}
