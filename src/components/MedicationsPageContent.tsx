"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { OtcSection } from "@/components/OtcSection";
import { useLanguage } from "@/lib/i18n/context";

export function MedicationsDisclaimer() {
  const { t } = useLanguage();

  return (
    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
      <strong>{t("med.disclaimerLead")}</strong> {t("med.disclaimerBody")}
    </div>
  );
}

interface MedicationsPageMainProps {
  symptoms: string[];
}

export function MedicationsPageMain({ symptoms }: MedicationsPageMainProps) {
  const { t, symptomLabel } = useLanguage();
  const [symptom, setSymptom] = useState("");

  const heroTitle = symptom
    ? t("med.heroTitleSymptom", { symptom: symptomLabel(symptom) })
    : t("med.heroTitle");

  const heroSubtitle = `${t("med.disclaimerLead")} ${t("med.disclaimerBody")}`;

  return (
    <>
      <PageHero
        variant="medications"
        badge={t("med.eyebrow")}
        title={heroTitle}
        subtitle={heroSubtitle}
        showHeart={false}
        rounded
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 pb-4 w-full">
        <MedicationsDisclaimer />
        <OtcSection symptoms={symptoms} onSymptomChange={setSymptom} />
        <PrivacyFooter />
      </main>
    </>
  );
}
