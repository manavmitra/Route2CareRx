"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BookIcon, LocationPinIcon, PillIcon } from "./icons/NavIcons";

const NAV_ITEMS = [
  {
    href: "/clinics",
    key: "nav.clinics",
    shortKey: "nav.clinics.short",
    Icon: LocationPinIcon,
  },
  {
    href: "/medications",
    key: "nav.medications",
    shortKey: "nav.medications.short",
    Icon: PillIcon,
  },
  {
    href: "/resources",
    key: "nav.resources",
    shortKey: "nav.resources.short",
    Icon: BookIcon,
  },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 pt-3 pb-0">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/clinics"
            className="font-bold text-lg text-primary-dark hover:text-primary transition-colors min-w-0 tracking-tight"
          >
            Route2CareRx
          </Link>
          <LanguageSwitcher />
        </div>

        <nav
          aria-label={t("nav.main")}
          className="mt-3 flex items-stretch gap-1 sm:gap-2 -mb-px"
        >
          {NAV_ITEMS.map(({ href, key, shortKey, Icon }) => {
            const active =
              pathname === href || (href === "/clinics" && pathname === "/");
            return (
              <a
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 sm:flex-none flex-col items-center gap-1 px-2 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                  active
                    ? "text-primary-dark border-primary"
                    : "text-muted border-transparent hover:text-foreground hover:border-slate-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${active ? "text-primary-dark" : "text-slate-400"}`}
                />
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
