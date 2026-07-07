"use client";

import { useState } from "react";
import type { OtcMedication } from "@/lib/otc-types";
import { useLanguage } from "@/lib/i18n/context";
import { OtcProductList } from "./OtcProductList";
import { RxNormLinks } from "./RxNormLinks";

interface OtcMedicationCardProps {
  medication: OtcMedication;
}

export function OtcMedicationCard({ medication }: OtcMedicationCardProps) {
  const { t } = useLanguage();
  const [showSafety, setShowSafety] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const storeLabel = medication.commonExamples?.trim() || medication.name;

  return (
    <article className="bg-card rounded-xl border border-border p-4 md:p-5">
      <div className="min-w-0">
        <span className="text-xs font-medium text-violet-700">{medication.category}</span>
        <h3 className="text-lg font-semibold leading-snug mt-0.5">{storeLabel}</h3>
        <p className="text-sm text-muted mt-1">
          {t("otc.activeIngredientLabel")}: {medication.name}
        </p>
        {medication.usedFor && (
          <p className="text-sm text-muted mt-2 leading-relaxed">{medication.usedFor}</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowSafety((open) => !open)}
          className="text-sm font-medium text-accent hover:underline"
          aria-expanded={showSafety}
        >
          {showSafety ? t("otc.hideSafety") : t("otc.showSafety")}
        </button>
        <button
          type="button"
          onClick={() => setShowReferences((open) => !open)}
          className="text-sm font-medium text-accent hover:underline"
          aria-expanded={showReferences}
        >
          {showReferences ? t("otc.hideReferences") : t("otc.showReferences")}
        </button>
      </div>

      {showSafety && (
        <dl className="mt-3 pt-3 border-t border-border space-y-3 text-sm">
          {medication.sideEffects && (
            <div>
              <dt className="font-medium text-foreground mb-0.5">
                {t("otc.sideEffectsLabel")}
              </dt>
              <dd className="text-muted leading-relaxed">{medication.sideEffects}</dd>
            </div>
          )}

          {medication.doNotUseIf && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <dt className="font-medium text-amber-900 mb-0.5">
                {t("otc.doNotUseLabel")}
              </dt>
              <dd className="text-amber-800 leading-relaxed">{medication.doNotUseIf}</dd>
            </div>
          )}

          {medication.interactions && (
            <div>
              <dt className="font-medium text-foreground mb-0.5">
                {t("otc.interactionsLabel")}
              </dt>
              <dd className="text-muted leading-relaxed">{medication.interactions}</dd>
            </div>
          )}

          {medication.seekCareIf && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <dt className="font-medium text-red-900 mb-0.5">
                {t("otc.seekCareLabel")}
              </dt>
              <dd className="text-red-800 leading-relaxed">{medication.seekCareIf}</dd>
            </div>
          )}
        </dl>
      )}

      {showReferences && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <RxNormLinks
            drugName={medication.substanceName ?? medication.name}
            dailyMedUrl={medication.sourceUrl || undefined}
          />
          <OtcProductList medication={medication} embedded />
        </div>
      )}
    </article>
  );
}
