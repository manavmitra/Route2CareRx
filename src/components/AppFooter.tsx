"use client";

import { useLanguage } from "@/lib/i18n/context";

export function AppFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-muted space-y-2">
        <p>{t("footer.data")}</p>
        <p>{t("footer.verify")}</p>
      </div>
    </footer>
  );
}
