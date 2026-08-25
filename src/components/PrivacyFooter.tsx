"use client";

import { ShieldCheckIcon } from "./icons/NavIcons";
import { useLanguage } from "@/lib/i18n/context";

export function PrivacyFooter() {
  const { t } = useLanguage();

  return (
    <p className="flex items-center justify-center gap-2 text-xs text-muted text-center py-6">
      <ShieldCheckIcon className="w-4 h-4 text-primary shrink-0" />
      {t("privacy.short")}
    </p>
  );
}
