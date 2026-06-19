import type { OtcMedication } from "./otc-types";

const HOMEOPATHIC_PATTERN =
  /homeopath|HPUS\b|homeopathic dilution|bach flower|not accepted medical evidence|traditional homeopathic|homeopathic principles|homeopathic remedy|homeopathic materia medica|homeopathic indications|pellets under the tongue|sub-lingual pellets|homeopathic dilution/i;

const HOME_REMEDY_PATTERN =
  /home remedy|miscellaneous home|folk remedy|herbal remedy only/i;

const BOTANICAL_HOMEOPATHIC_PATTERN =
  /\b(pollen|whole|flower|root|leaf|bark|seed)\b/i;

export function isHomeopathicOrHomeRemedy(m: OtcMedication): boolean {
  const text = [
    m.name,
    m.category,
    m.symptomUseCase,
    m.usedFor,
    m.ingredients,
    m.commonExamples,
    m.sideEffects,
    m.doNotUseIf,
    m.interactions,
    m.seekCareIf,
  ]
    .join(" ")
    .toLowerCase();

  if (HOMEOPATHIC_PATTERN.test(text) || HOME_REMEDY_PATTERN.test(text)) {
    return true;
  }

  if (/\bpollen\b/i.test(m.name)) return true;

  if (
    m.category === "General OTC" &&
    BOTANICAL_HOMEOPATHIC_PATTERN.test(m.name) &&
    !m.interactions
  ) {
    return true;
  }

  return false;
}

/** Curated conventional OTC entries from the ClinMedFind symptom guide. */
export function isCuratedConventionalOtc(m: OtcMedication): boolean {
  if (isHomeopathicOrHomeRemedy(m)) return false;

  return (
    (m.doNotUseIf?.length ?? 0) > 30 &&
    (m.seekCareIf?.length ?? 0) > 20 &&
    (m.interactions?.length ?? 0) > 10 &&
    m.category !== "General OTC"
  );
}

export function isConventionalOtcMedication(m: OtcMedication): boolean {
  return isCuratedConventionalOtc(m);
}

export function filterConventionalOtcMedications(
  medications: OtcMedication[]
): OtcMedication[] {
  return medications.filter(isConventionalOtcMedication);
}
