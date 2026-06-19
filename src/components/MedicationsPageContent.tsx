"use client";

import { useLanguage } from "@/lib/i18n/context";

export function MedicationsPageHero() {
  const { t } = useLanguage();

  return (
    <header className="bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-700 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <p className="text-violet-100 text-sm font-medium tracking-wide uppercase mb-3">
          {t("med.eyebrow")}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight max-w-2xl">
          {t("med.title")}
        </h1>
        <p className="mt-3 text-base md:text-lg text-violet-50 max-w-2xl leading-relaxed">
          {t("med.subtitle")}
        </p>
      </div>
    </header>
  );
}

export function MedicationsDisclaimer() {
  const { t } = useLanguage();

  return (
    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
      <strong>{t("med.disclaimerLead")}</strong> {t("med.disclaimerBody")}
    </div>
  );
}
