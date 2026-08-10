"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV_ITEMS = [
  { href: "/clinics", key: "nav.clinics", shortKey: "nav.clinics.short" },
  { href: "/medications", key: "nav.medications", shortKey: "nav.medications.short" },
  { href: "/resources", key: "nav.resources", shortKey: "nav.resources.short" },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <a
            href="/clinics"
            className="font-bold text-lg text-primary-dark hover:text-primary transition-colors min-w-0"
          >
            Route2CareRx
          </a>
          <LanguageSwitcher />
        </div>

        <nav
          aria-label={t("nav.main")}
          className="mt-2 flex flex-wrap gap-1.5 sm:gap-2"
        >
          {NAV_ITEMS.map(({ href, key, shortKey }) => {
            const active =
              pathname === href || (href === "/clinics" && pathname === "/");
            return (
              <a
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-100 text-primary-dark"
                    : "text-muted hover:text-foreground hover:bg-slate-100"
                }`}
              >
                <span className="sm:hidden">{t(shortKey)}</span>
                <span className="hidden sm:inline">{t(key)}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
