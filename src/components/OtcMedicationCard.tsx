"use client";

import { useState } from "react";
import type { OtcMedication } from "@/lib/otc-types";
import { useLanguage } from "@/lib/i18n/context";
import { OtcProductList } from "./OtcProductList";
import { RxNormLinks } from "./RxNormLinks";
import { ChevronRightIcon } from "./icons/NavIcons";

interface OtcMedicationCardProps {
  medication: OtcMedication;
  accent?: "teal" | "purple" | "blue";
}

const ACCENT_STYLES = {
  teal: {
    icon: "bg-teal-50 text-teal-700",
    tag: "bg-teal-50 text-teal-800 border-teal-200",
    tip: "text-emerald-800 bg-emerald-50 border-emerald-200",
  },
  purple: {
    icon: "bg-violet-50 text-violet-700",
    tag: "bg-violet-50 text-violet-800 border-violet-200",
    tip: "text-violet-800 bg-violet-50 border-violet-200",
  },
  blue: {
    icon: "bg-blue-50 text-blue-700",
    tag: "bg-blue-50 text-blue-800 border-blue-200",
    tip: "text-blue-800 bg-blue-50 border-blue-200",
  },
};

const MED_ICONS = ["💊", "💉", "🧴"];

export function OtcMedicationCard({ medication, accent = "teal" }: OtcMedicationCardProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const storeLabel = medication.commonExamples?.trim() || medication.name;
  const styles = ACCENT_STYLES[accent];
  const icon = MED_ICONS[medication.id.length % MED_ICONS.length];

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
        aria-expanded={expanded}
      >
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${styles.icon}`}
          aria-hidden
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border mb-1 ${styles.tag}`}>
            {medication.category}
          </span>
          <h3 className="font-bold leading-snug break-words">{storeLabel}</h3>
          <p className="text-sm text-muted mt-0.5 line-clamp-2">{medication.usedFor}</p>
        </div>
        <ChevronRightIcon
          className={`shrink-0 w-5 h-5 text-muted transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 text-sm">
          <p className="text-muted">
            {t("otc.activeIngredientLabel")}: <strong className="text-foreground">{medication.name}</strong>
          </p>

          {medication.doNotUseIf && (
            <div className={`p-3 rounded-xl border text-sm ${styles.tip}`}>
              {medication.doNotUseIf}
            </div>
          )}

          {medication.sideEffects && (
            <div>
              <p className="font-medium">{t("otc.sideEffectsLabel")}</p>
              <p className="text-muted mt-0.5 leading-relaxed">{medication.sideEffects}</p>
            </div>
          )}

          {medication.interactions && (
            <div>
              <p className="font-medium">{t("otc.interactionsLabel")}</p>
              <p className="text-muted mt-0.5 leading-relaxed">{medication.interactions}</p>
            </div>
          )}

          {medication.seekCareIf && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="font-medium text-red-900">{t("otc.seekCareLabel")}</p>
              <p className="text-red-800 mt-0.5 leading-relaxed">{medication.seekCareIf}</p>
            </div>
          )}

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
