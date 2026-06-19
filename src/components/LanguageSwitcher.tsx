"use client";

import { LOCALES } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 shrink-0"
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
            className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              active
                ? "bg-teal-100 text-primary-dark"
                : "text-muted hover:text-foreground hover:bg-slate-100"
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
