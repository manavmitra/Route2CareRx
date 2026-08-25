"use client";

import type { ExternalResource } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";
import { resourceLabelsEs } from "@/lib/i18n/translations";
import { ChevronRightIcon } from "./icons/NavIcons";

interface ExternalResourcesProps {
  resources: ExternalResource[];
}

const CATEGORY_ICONS: Record<string, string> = {
  "Free & Charitable Clinics": "🏠",
  "Cancer Screening": "🎗️",
  "Mental Health & Substance Use": "🧠",
  "Community Health Centers": "🏥",
};

const CATEGORY_ORDER = [
  "Mental Health & Substance Use",
  "Cancer Screening",
  "Free & Charitable Clinics",
  "Community Health Centers",
];

export function ExternalResources({ resources }: ExternalResourcesProps) {
  const { t, locale } = useLanguage();

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: resources.filter((r) => r.category === category),
  })).filter((g) => g.items.length > 0);

  const popular = resources.slice(0, 2);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold">{t("resources.categoriesTitle")}</h2>
        <p className="text-sm text-muted mt-1">{t("resources.categoriesDesc")}</p>
        <ul className="mt-4 space-y-2">
          {grouped.map(({ category, items }) => {
            const sample = items[0];
            const esLabels = resourceLabelsEs[sample.name];
            const description =
              locale === "es" && esLabels
                ? esLabels.description
                : sample.description;

            return (
              <li key={category}>
                <a
                  href={sample.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <span
                    className="shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl"
                    aria-hidden
                  >
                    {CATEGORY_ICONS[category] ?? "📋"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold group-hover:text-primary transition-colors">
                      {locale === "es" && esLabels ? esLabels.category : category}
                    </p>
                    <p className="text-sm text-muted line-clamp-2">{description}</p>
                  </div>
                  <ChevronRightIcon className="shrink-0 w-5 h-5 text-muted" />
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl bg-sky-50 border border-sky-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">{t("resources.popularTitle")}</h2>
          <span className="text-sm text-accent">{t("resources.viewAll")} ↗</span>
        </div>
        <ul className="space-y-3">
          {popular.map((resource) => {
            const esLabels = resourceLabelsEs[resource.name];
            const description =
              locale === "es" && esLabels
                ? esLabels.description
                : resource.description;

            return (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all"
                >
                  <span className="font-semibold text-accent">
                    {resource.name} ↗
                  </span>
                  <p className="text-sm text-muted mt-1">{description}</p>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className="bg-slate-50 rounded-2xl border border-border p-6"
        aria-labelledby="external-resources-heading"
      >
        <h2 id="external-resources-heading" className="text-lg font-bold mb-2">
          {t("resources.heading")}
        </h2>
        <p className="text-sm text-muted mb-4">{t("resources.desc")}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {resources.map((resource) => {
            const esLabels = resourceLabelsEs[resource.name];
            const category =
              locale === "es" && esLabels ? esLabels.category : resource.category;
            const description =
              locale === "es" && esLabels
                ? esLabels.description
                : resource.description;

            return (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full p-4 rounded-xl bg-card border border-border hover:border-primary transition-all"
                >
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    {category}
                  </span>
                  <span className="block mt-1 font-semibold">{resource.name} ↗</span>
                  <span className="block mt-1 text-sm text-muted">{description}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
