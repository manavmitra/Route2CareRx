"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  filterMedicationsByQuery,
  getMedicationsForSymptom,
  getSymptomEntry,
} from "@/lib/otc-data";
import { useLanguage } from "@/lib/i18n/context";
import { OtcMedicationCard } from "./OtcMedicationCard";
import { LocationPinIcon, ChevronRightIcon } from "./icons/NavIcons";

interface OtcSymptomSearchProps {
  symptoms: string[];
  onSymptomChange?: (symptom: string) => void;
}

const CARD_ACCENTS = ["teal", "purple", "blue"] as const;

export function OtcSymptomSearch({ symptoms, onSymptomChange }: OtcSymptomSearchProps) {
  const { t, symptomLabel: labelSymptom } = useLanguage();
  const [symptom, setSymptom] = useState("");
  const [query, setQuery] = useState("");

  const entry = symptom ? getSymptomEntry(symptom) : undefined;

  const medications = useMemo(() => {
    if (!symptom) return [];
    const matched = getMedicationsForSymptom(symptom);
    return filterMedicationsByQuery(matched, query);
  }, [symptom, query]);

  const handleSymptomChange = (value: string) => {
    setSymptom(value);
    setQuery("");
    onSymptomChange?.(value);
  };

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-4 md:p-5">
        <label htmlFor="otc-symptom" className="block text-sm font-medium mb-2">
          {t("otc.symptomLabel")}
        </label>
        <select
          id="otc-symptom"
          value={symptom}
          onChange={(e) => handleSymptomChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t("otc.symptomPlaceholder")}</option>
          {symptoms.map((s) => (
            <option key={s} value={s}>
              {labelSymptom(s)}
            </option>
          ))}
        </select>
        {!symptom && (
          <p className="mt-3 text-sm text-muted">
            {t("otc.symptomHint", { count: symptoms.length })}
          </p>
        )}
      </div>

      {symptom && (
        <>
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-100 text-violet-900 px-3 py-1.5 text-sm font-medium">
            🧠 {t("med.symptomTag", { symptom: labelSymptom(symptom) })}
          </p>

          <div>
            <h2 className="text-xl font-bold">{t("med.recommendedOtc")}</h2>
            <p className="text-sm text-muted mt-1">{t("med.recommendedOtcDesc")}</p>
          </div>

          {entry && (
            <details className="rounded-xl border border-violet-200 bg-violet-50/80 text-sm group">
              <summary className="cursor-pointer px-4 py-3 font-medium text-violet-900 list-none [&::-webkit-details-marker]:hidden">
                {t("otc.guidanceFor", { symptom: labelSymptom(entry.symptom) })}
              </summary>
              <div className="px-4 pb-4 space-y-3 border-t border-violet-200/80 pt-3">
                <div>
                  <p className="font-medium text-violet-900">{t("otc.considerFirst")}</p>
                  <p className="text-violet-800 mt-0.5 leading-relaxed">{entry.considerFirst}</p>
                </div>
                {entry.otherOptions && (
                  <div>
                    <p className="font-medium text-violet-900">{t("otc.otherOptions")}</p>
                    <p className="text-violet-800 mt-0.5 leading-relaxed">{entry.otherOptions}</p>
                  </div>
                )}
                {entry.avoidRedFlags && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="font-medium text-red-900">{t("otc.avoidRedFlags")}</p>
                    <p className="text-red-800 mt-0.5 leading-relaxed">{entry.avoidRedFlags}</p>
                  </div>
                )}
              </div>
            </details>
          )}

          {symptom && (
            <div className="flex-1">
              <label htmlFor="otc-refine" className="sr-only">
                {t("otc.refineLabel")}
              </label>
              <input
                id="otc-refine"
                type="search"
                placeholder={t("otc.refinePlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm"
              />
            </div>
          )}

          {medications.length === 0 ? (
            <div className="bg-slate-50 border border-border rounded-2xl p-8 text-center">
              <p className="font-medium">{t("otc.noMatch")}</p>
              <p className="text-sm text-muted mt-2">{t("otc.noMatchHint")}</p>
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Medication results">
              {medications.map((med, i) => (
                <li key={med.id}>
                  <OtcMedicationCard
                    medication={med}
                    accent={CARD_ACCENTS[i % CARD_ACCENTS.length]}
                  />
                </li>
              ))}
            </ul>
          )}

          {entry?.avoidRedFlags && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
              <div className="flex gap-3">
                <span className="shrink-0 w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-lg" aria-hidden>
                  !
                </span>
                <div>
                  <h3 className="font-bold text-amber-950">{t("med.whenToGetCare")}</h3>
                  <p className="text-sm text-amber-900 mt-1">{t("med.whenToGetCareIntro")}</p>
                  <p className="text-sm text-amber-900 mt-2 whitespace-pre-line leading-relaxed">
                    {entry.avoidRedFlags}
                  </p>
                  <p className="text-sm font-medium text-amber-950 mt-3">{t("med.call911")}</p>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/medications#pharmacies"
            className="flex items-center justify-between gap-3 w-full p-4 rounded-2xl border-2 border-violet-300 bg-card hover:bg-violet-50/50 transition-colors group"
          >
            <span className="flex items-center gap-2 font-semibold text-violet-900">
              <LocationPinIcon className="w-5 h-5" />
              {t("med.findPharmacies")}
            </span>
            <ChevronRightIcon className="shrink-0 w-5 h-5 text-violet-600 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </>
      )}
    </div>
  );
}
