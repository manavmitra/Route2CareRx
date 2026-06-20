"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV_ITEMS = [
  { href: "/clinics", key: "nav.clinics" },
  { href: "/medications", key: "nav.medications" },
  { href: "/resources", key: "nav.resources" },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href="/clinics"
          className="font-bold text-lg text-primary-dark hover:text-primary transition-colors shrink-0"
        >
          Route2CareRx
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <nav aria-label={t("nav.main")} className="flex gap-1 sm:gap-2">
            {NAV_ITEMS.map(({ href, key }) => {
              const active =
                pathname === href || (href === "/clinics" && pathname === "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-teal-100 text-primary-dark"
                      : "text-muted hover:text-foreground hover:bg-slate-100"
                  }`}
                >
                  {t(key)}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
