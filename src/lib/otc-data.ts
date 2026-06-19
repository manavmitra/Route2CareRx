import type { OtcDatabase, OtcMedication } from "./otc-types";
import { filterConventionalOtcMedications } from "./otc-filters";
import otcJson from "../../data/otc_medications.json";

const database = otcJson as OtcDatabase;
const conventionalMedications = filterConventionalOtcMedications(
  database.medications
);

export function getOtcDatabase(): OtcDatabase {
  return {
    ...database,
    medications: conventionalMedications,
    stats: {
      activeIngredients: conventionalMedications.length,
      starterIngredients: conventionalMedications.length,
      fdaLabelsScanned: database.stats?.fdaLabelsScanned ?? 0,
    },
  };
}

export function getAllMedications(): OtcMedication[] {
  return conventionalMedications;
}

export function getMedicationCategories(): string[] {
  return Array.from(
    new Set(conventionalMedications.map((m) => m.category).filter(Boolean))
  ).sort();
}

export function getSymptoms(): string[] {
  return database.symptomLookup.map((s) => s.symptom);
}

export function getSymptomEntry(symptom: string) {
  return database.symptomLookup.find((s) => s.symptom === symptom);
}

export function getMedicationsForSymptom(symptom: string): OtcMedication[] {
  const entry = getSymptomEntry(symptom);
  if (!entry) return [];

  const guidanceText =
    `${entry.considerFirst} ${entry.otherOptions} ${entry.notes}`.toLowerCase();

  return conventionalMedications.filter((m) => {
    const nameLower = m.name.toLowerCase();
    const substanceLower = (m.substanceName ?? m.name).toLowerCase();
    if (guidanceText.includes(nameLower) || guidanceText.includes(substanceLower)) {
      return true;
    }

    const firstWord = nameLower.split(/[\s(/]+/)[0];
    if (firstWord.length > 4 && guidanceText.includes(firstWord)) return true;

    const symptomWords = symptom
      .toLowerCase()
      .split(/[/,&]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3);
    const medText =
      `${m.symptomUseCase} ${m.usedFor} ${m.category} ${m.name}`.toLowerCase();
    return symptomWords.some((w) => medText.includes(w));
  });
}

export function filterMedicationsByQuery(
  medications: OtcMedication[],
  query: string
): OtcMedication[] {
  const q = query.trim().toLowerCase();
  if (!q) return medications;

  return medications.filter((m) => {
    const haystack = [
      m.name,
      m.substanceName,
      m.symptomUseCase,
      m.usedFor,
      m.ingredients,
      m.commonExamples,
      m.sideEffects,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getOtcStats() {
  return {
    activeIngredients: conventionalMedications.length,
    starterIngredients: conventionalMedications.length,
    fdaLabelsScanned: database.stats?.fdaLabelsScanned ?? 0,
  };
}

export function searchMedications(query: string, category?: string): OtcMedication[] {
  const q = query.trim().toLowerCase();
  let results = conventionalMedications;

  if (category && category !== "all") {
    results = results.filter((m) => m.category === category);
  }

  if (!q) return results;

  return results.filter((m) => {
    const haystack = [
      m.name,
      m.substanceName,
      m.category,
      m.symptomUseCase,
      m.usedFor,
      m.ingredients,
      m.commonExamples,
      m.sideEffects,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
