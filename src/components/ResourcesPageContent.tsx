"use client";

import { PageHero } from "@/components/PageHero";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { useLanguage } from "@/lib/i18n/context";

export function ResourcesPageHero() {
  const { t } = useLanguage();

  return (
    <PageHero
      variant="resources"
      badge={t("resources.eyebrow")}
      title={t("resources.exploreTitle")}
      subtitle={t("resources.exploreSubtitle")}
      rounded
    />
  );
}

export function ResourcesPageFooter() {
  return <PrivacyFooter />;
}
