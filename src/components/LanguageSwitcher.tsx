"use client";

import { LOCALES } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, t, mounted } = useLanguage();

  if (!mounted) {
    return (
      <div
        className="inline-flex items-center rounded-full border border-border bg-slate-50 p-0.5 shrink-0"
        aria-hidden
      >
        {LOCALES.map(({ code }) => (
          <span
            key={code}
            className="px-3 py-1 rounded-full text-xs font-semibold invisible"
          >
            {code.toUpperCase()}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-slate-50 p-0.5 shrink-0"
      role="group"
      aria-label={t("lang.switch")}
    >
      {LOCALES.map(({ code }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              active
                ? "bg-teal-100 text-primary-dark shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
            aria-pressed={active}
            lang={code}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
