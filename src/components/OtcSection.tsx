"use client";

import { OtcSymptomSearch } from "./OtcSymptomSearch";
import { OtcStoreSearch } from "./OtcStoreSearch";
import { useLanguage } from "@/lib/i18n/context";

interface OtcSectionProps {
  symptoms: string[];
  onSymptomChange?: (symptom: string) => void;
}

export function OtcSection({ symptoms, onSymptomChange }: OtcSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-14">
      <div aria-labelledby="otc-symptom-heading">
        <div className="mb-6">
          <h3 id="otc-symptom-heading" className="text-xl font-bold">
            {t("med.symptomTitle")}
          </h3>
          <p className="mt-1 text-muted text-sm max-w-2xl">{t("med.symptomDesc")}</p>
        </div>
        <OtcSymptomSearch symptoms={symptoms} onSymptomChange={onSymptomChange} />
      </div>

      <hr className="border-border" id="pharmacies" />

      <div aria-labelledby="otc-stores-heading">
        <div className="mb-6">
          <h3 id="otc-stores-heading" className="text-xl font-bold">
            {t("med.storesTitle")}
          </h3>
          <p className="mt-1 text-muted text-sm max-w-2xl">{t("med.storesDesc")}</p>
        </div>
        <OtcStoreSearch />
      </div>
    </div>
  );
}
