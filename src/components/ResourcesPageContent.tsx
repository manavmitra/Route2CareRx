"use client";

import { useLanguage } from "@/lib/i18n/context";

export function ResourcesPageHero() {
  const { t } = useLanguage();

  return (
    <header className="bg-gradient-to-br from-sky-700 via-blue-600 to-indigo-700 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <p className="text-sky-100 text-sm font-medium tracking-wide uppercase mb-3">
          {t("resources.eyebrow")}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight max-w-2xl">
          {t("resources.title")}
        </h1>
        <p className="mt-3 text-base md:text-lg text-sky-50 max-w-2xl leading-relaxed">
          {t("resources.subtitle")}
        </p>
      </div>
    </header>
  );
}
