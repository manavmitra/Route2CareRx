"use client";

import type { OtcMedication } from "@/lib/otc-types";
import { useLanguage } from "@/lib/i18n/context";
import { OtcProductList } from "./OtcProductList";
import { RxNormLinks } from "./RxNormLinks";

interface OtcMedicationCardProps {
  medication: OtcMedication;
}

export function OtcMedicationCard({ medication }: OtcMedicationCardProps) {
  const { t } = useLanguage();
  const storeLabel = medication.commonExamples?.trim() || medication.name;

  return (
    <article className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 text-violet-800 text-xs font-medium">
              {medication.category}
            </span>
            {medication.fdaLabelCount != null && medication.fdaLabelCount > 0 && (
              <span className="text-xs text-muted">
                {medication.fdaLabelCount} FDA label
                {medication.fdaLabelCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1">
            {t("otc.exampleProducts")}
          </p>
          <h3 className="text-xl font-semibold leading-tight">{storeLabel}</h3>
          <p className="text-sm text-muted mt-1">
            {t("otc.activeIngredientLabel")}: {medication.name}
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="font-semibold text-foreground mb-1">What it&apos;s used for</dt>
          <dd className="text-muted leading-relaxed">
            {medication.symptomUseCase}
            {medication.usedFor && (
              <>
                {" "}
                — {medication.usedFor}
              </>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-semibold text-foreground mb-1">
            {t("otc.activeIngredientLabel")}
          </dt>
          <dd className="text-muted leading-relaxed">{medication.ingredients}</dd>
        </div>

        {medication.sideEffects && (
          <div>
            <dt className="font-semibold text-foreground mb-1">Common side effects</dt>
            <dd className="text-muted leading-relaxed">{medication.sideEffects}</dd>
          </div>
        )}

        {medication.doNotUseIf && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <dt className="font-semibold text-amber-900 mb-1">
              Do not use / ask a clinician first if…
            </dt>
            <dd className="text-amber-800 leading-relaxed">{medication.doNotUseIf}</dd>
          </div>
        )}

        {medication.interactions && (
          <div>
            <dt className="font-semibold text-foreground mb-1">
              Interactions &amp; cautions
            </dt>
            <dd className="text-muted leading-relaxed">{medication.interactions}</dd>
          </div>
        )}

        {medication.seekCareIf && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <dt className="font-semibold text-red-900 mb-1">
              Stop use &amp; seek care if…
            </dt>
            <dd className="text-red-800 leading-relaxed">{medication.seekCareIf}</dd>
          </div>
        )}
      </dl>

      <OtcProductList medication={medication} />

      <RxNormLinks
        drugName={medication.substanceName ?? medication.name}
        dailyMedUrl={medication.sourceUrl || undefined}
      />
    </article>
  );
}
