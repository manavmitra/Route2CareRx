"use client";

import type { ExternalResource } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";
import { resourceLabelsEs } from "@/lib/i18n/translations";

interface ExternalResourcesProps {
  resources: ExternalResource[];
}

export function ExternalResources({ resources }: ExternalResourcesProps) {
  const { t, locale } = useLanguage();

  return (
    <section
      className="bg-slate-50 rounded-2xl border border-border p-6 md:p-8"
      aria-labelledby="external-resources-heading"
    >
      <h2 id="external-resources-heading" className="text-xl font-bold mb-2">
        {t("resources.heading")}
      </h2>
      <p className="text-sm text-muted mb-6">{t("resources.desc")}</p>
      <ul className="grid gap-4 sm:grid-cols-2">
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
                className="block h-full p-4 rounded-xl bg-card border border-border hover:border-primary hover:shadow-sm transition-all group"
              >
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                  {category}
                </span>
                <span className="block mt-1 font-semibold group-hover:text-primary transition-colors">
                  {resource.name} ↗
                </span>
                <span className="block mt-1 text-sm text-muted">{description}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
