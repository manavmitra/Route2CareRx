"use client";

import { useMemo, useState } from "react";
import {
  filterMedicationsByQuery,
  getMedicationsForSymptom,
  getSymptomEntry,
} from "@/lib/otc-data";
import { useLanguage } from "@/lib/i18n/context";
import { OtcMedicationCard } from "./OtcMedicationCard";

interface OtcSymptomSearchProps {
  symptoms: string[];
}

export function OtcSymptomSearch({ symptoms }: OtcSymptomSearchProps) {
  const { t, symptomLabel: labelSymptom } = useLanguage();
  const [symptom, setSymptom] = useState("");
  const [query, setQuery] = useState("");

  const entry = symptom ? getSymptomEntry(symptom) : undefined;

  const medications = useMemo(() => {
    if (!symptom) return [];
    const matched = getMedicationsForSymptom(symptom);
    return filterMedicationsByQuery(matched, query);
  }, [symptom, query]);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="otc-symptom" className="block text-sm font-medium mb-2">
              {t("otc.symptomLabel")}
            </label>
            <select
              id="otc-symptom"
              value={symptom}
              onChange={(e) => {
                setSymptom(e.target.value);
                setQuery("");
              }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            >
              <option value="">{t("otc.symptomPlaceholder")}</option>
              {symptoms.map((s) => (
                <option key={s} value={s}>
                  {labelSymptom(s)}
                </option>
              ))}
            </select>
          </div>

          {symptom && (
            <div className="flex-1">
              <label htmlFor="otc-refine" className="block text-sm font-medium mb-2">
                {t("otc.refineLabel")}
              </label>
              <input
                id="otc-refine"
                type="search"
                placeholder={t("otc.refinePlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          )}
        </div>

        {!symptom && (
          <p className="mt-4 text-sm text-muted">
            {t("otc.symptomHint", { count: symptoms.length })}
          </p>
        )}
      </div>

      {entry && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 space-y-4 text-sm">
          <h3 className="font-semibold text-violet-900 text-base">
            {t("otc.guidanceFor", { symptom: labelSymptom(entry.symptom) })}
          </h3>
          <div>
            <p className="font-medium text-violet-900">{t("otc.considerFirst")}</p>
            <p className="text-violet-800 mt-1 leading-relaxed">{entry.considerFirst}</p>
          </div>
          {entry.otherOptions && (
            <div>
              <p className="font-medium text-violet-900">{t("otc.otherOptions")}</p>
              <p className="text-violet-800 mt-1 leading-relaxed">{entry.otherOptions}</p>
            </div>
          )}
          {entry.avoidRedFlags && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="font-medium text-red-900">{t("otc.avoidRedFlags")}</p>
              <p className="text-red-800 mt-1 leading-relaxed">{entry.avoidRedFlags}</p>
            </div>
          )}
          {entry.notes && (
            <p className="text-violet-700 italic">{entry.notes}</p>
          )}
        </div>
      )}

      {symptom && (
        <>
          <p className="text-sm text-muted">
            {t("otc.matched", { count: medications.length })}
          </p>

          {medications.length === 0 ? (
            <div className="bg-slate-50 border border-border rounded-2xl p-8 text-center">
              <p className="font-medium">{t("otc.noMatch")}</p>
              <p className="text-sm text-muted mt-2">{t("otc.noMatchHint")}</p>
            </div>
          ) : (
            <ul className="space-y-4" aria-label="Medication results">
              {medications.map((med) => (
                <li key={med.id}>
                  <OtcMedicationCard medication={med} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
