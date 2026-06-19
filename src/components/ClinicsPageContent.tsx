"use client";

import { useLanguage } from "@/lib/i18n/context";

export function ClinicsPageHero() {
  const { t } = useLanguage();

  return (
    <header className="bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <p className="text-teal-100 text-sm font-medium tracking-wide uppercase mb-3">
          {t("clinics.eyebrow")}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight max-w-2xl">
          {t("clinics.title")}
        </h1>
        <p className="mt-3 text-base md:text-lg text-teal-50 max-w-2xl leading-relaxed">
          {t("clinics.subtitle")}
        </p>
      </div>
    </header>
  );
}

export function ClinicsPageSteps() {
  const { t } = useLanguage();

  return (
    <div
      className="mt-10 grid sm:grid-cols-3 gap-4 text-sm"
      aria-label={t("clinics.howItWorks")}
    >
      <div className="bg-card rounded-xl border border-border p-4">
        <span className="font-bold text-primary-dark">1.</span> {t("clinics.step1")}
      </div>
      <div className="bg-card rounded-xl border border-border p-4">
        <span className="font-bold text-primary-dark">2.</span> {t("clinics.step2")}
      </div>
      <div className="bg-card rounded-xl border border-border p-4">
        <span className="font-bold text-primary-dark">3.</span> {t("clinics.step3")}
      </div>
    </div>
  );
}
