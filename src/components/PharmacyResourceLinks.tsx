"use client";

import type { PharmacyExternalResource } from "@/lib/pharmacy-types";
import { useLanguage } from "@/lib/i18n/context";

const PHARMACY_RESOURCE_LABELS_ES: Record<
  string,
  { description: string; category: string }
> = {
  "HRSA Find a Health Center": {
    category: "Centros comunitarios de salud",
    description:
      "Centros de salud financiados federalmente — muchos ofrecen farmacia en el sitio y medicamentos con tarifa escalonada",
  },
  "NAFC Find a Clinic": {
    category: "Clínicas gratuitas y benéficas",
    description:
      "Más de 1,400 clínicas gratuitas y benéficas — algunas incluyen servicios de farmacia benéfica",
  },
  "FreeClinics.com": {
    category: "Clínicas gratuitas y benéficas",
    description:
      "Clínicas gratuitas y basadas en ingresos — algunas listan acceso a farmacia",
  },
  "NCPDP Pharmacy Database": {
    category: "Directorios de farmacias",
    description:
      "Directorio de farmacias de EE. UU. más completo — producto con licencia para inventario de medicamentos",
  },
  "RxNorm (NLM)": {
    category: "Información de medicamentos",
    description: "Nombres e identificadores estándar de medicamentos en EE. UU.",
  },
  "DailyMed (NLM)": {
    category: "Información de medicamentos",
    description: "Etiquetado y empaque de medicamentos aprobados por la FDA",
  },
};

interface PharmacyResourceLinksProps {
  resources: PharmacyExternalResource[];
}

export function PharmacyResourceLinks({ resources }: PharmacyResourceLinksProps) {
  const { t, locale } = useLanguage();

  return (
    <section
      className="bg-slate-50 rounded-2xl border border-border p-6 md:p-8"
      aria-labelledby="pharmacy-resources-heading"
    >
      <h3 id="pharmacy-resources-heading" className="text-lg font-bold mb-1">
        {t("store.moreResources")}
      </h3>
      <p className="text-sm text-muted mb-4">{t("store.moreResourcesDesc")}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {resources.map((resource) => {
          const es = PHARMACY_RESOURCE_LABELS_ES[resource.name];
          const category =
            locale === "es" && es ? es.category : resource.category;
          const description =
            locale === "es" && es ? es.description : resource.description;

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
