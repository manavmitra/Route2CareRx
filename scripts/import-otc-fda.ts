import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  filterConventionalOtcMedications,
  isHomeopathicOrHomeRemedy,
} from "../src/lib/otc-filters";

interface StarterMedication {
  id: string;
  category: string;
  symptomUseCase: string;
  name: string;
  commonExamples: string;
  usedFor: string;
  ingredients: string;
  sideEffects: string;
  doNotUseIf: string;
  interactions: string;
  seekCareIf: string;
  sourceUrl: string;
}

interface StarterDatabase {
  medications: StarterMedication[];
  symptomLookup: unknown[];
  updatedAt: string;
}

interface FdaLabel {
  openfda?: {
    substance_name?: string[];
    brand_name?: string[];
  };
  purpose?: string[];
  indications_and_usage?: string[];
  adverse_reactions?: string[];
  warnings?: string[];
  do_not_use?: string[];
  drug_interactions?: string[];
  stop_use?: string[];
  set_id?: string;
  active_ingredient?: string[];
}

function isHomeopathicLabel(label: FdaLabel): boolean {
  const text = [
    ...(label.purpose ?? []),
    ...(label.indications_and_usage ?? []),
    ...(label.active_ingredient ?? []),
    ...(label.warnings ?? []),
    ...(label.openfda?.brand_name ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return /homeopath|hpus\b|homeopathic dilution|traditional homeopathic|not accepted medical evidence|pellets under the tongue/.test(
    text
  );
}

interface IngredientAccumulator {
  substance: string;
  count: number;
  purpose: string[];
  usedFor: string[];
  sideEffects: string[];
  doNotUseIf: string[];
  interactions: string[];
  seekCareIf: string[];
  brandExamples: Set<string>;
  setId?: string;
}

interface OutputMedication extends StarterMedication {
  substanceName: string;
  fdaLabelCount: number;
}

const FDA_LABEL_SEARCH = encodeURIComponent('openfda.product_type:"HUMAN OTC DRUG"');
const PAGE_SIZE = 100;
const MAX_LABELS = 12_000;
const MIN_FREQUENCY = 2;
const MAX_INGREDIENTS = 900;

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function joinField(parts: string[] | undefined, maxLen = 600): string {
  if (!parts?.length) return "";
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trim()}…`;
}

function inferCategory(purpose: string, usedFor: string): string {
  const text = `${purpose} ${usedFor}`.toLowerCase();
  if (/pain|ache|fever|headache|cramp|arthritis/.test(text)) return "Pain / fever";
  if (/allerg|histamine|itch|hives|sneeze/.test(text)) return "Allergy / itch";
  if (/cough|cold|flu|congest|sinus|nasal/.test(text)) return "Cold / flu";
  if (/heartburn|acid|stomach|diarrhea|constip|laxative|gas|nausea/.test(text))
    return "Digestive";
  if (/sleep|insomnia/.test(text)) return "Sleep";
  if (/skin|acne|rash|foot|fung|sunburn|wound|cut/.test(text)) return "Skin / topical";
  if (/eye|ocular/.test(text)) return "Eye care";
  if (/oral|tooth|mouth|throat|lozenge/.test(text)) return "Oral / throat";
  return "General OTC";
}

function normalizeSubstance(name: string): string {
  return name.trim().toUpperCase();
}

function dailyMedUrl(name: string, setId?: string): string {
  if (setId) {
    return `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setId}`;
  }
  return `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(name)}`;
}

function buildFromAccumulator(
  acc: IngredientAccumulator,
  starter?: StarterMedication
): OutputMedication {
  const name = starter?.name ?? titleCase(acc.substance);
  const purpose = joinField(acc.purpose, 200);
  const usedFor = joinField(acc.usedFor);
  const doNotUse = joinField([...acc.doNotUseIf]);

  return {
    id: starter?.id ?? slug(acc.substance),
    category:
      starter?.category ?? inferCategory(joinField(acc.purpose, 300), usedFor),
    symptomUseCase: starter?.symptomUseCase || purpose,
    name,
    commonExamples:
      starter?.commonExamples ||
      Array.from(acc.brandExamples).slice(0, 6).join(", "),
    usedFor: starter?.usedFor || usedFor,
    ingredients: name,
    sideEffects: starter?.sideEffects || joinField(acc.sideEffects),
    doNotUseIf: starter?.doNotUseIf || doNotUse,
    interactions: starter?.interactions || joinField(acc.interactions),
    seekCareIf: starter?.seekCareIf || joinField(acc.seekCareIf),
    sourceUrl: starter?.sourceUrl || dailyMedUrl(name, acc.setId),
    substanceName: normalizeSubstance(starter?.name ?? acc.substance),
    fdaLabelCount: acc.count,
  };
}

function findStarterMatch(
  substance: string,
  starterBySubstance: Map<string, StarterMedication>,
  starterMeds: StarterMedication[]
): StarterMedication | undefined {
  if (starterBySubstance.has(substance)) {
    return starterBySubstance.get(substance);
  }
  return starterMeds.find((m) => {
    const key = normalizeSubstance(m.name);
    return key === substance || substance.startsWith(key) || key.startsWith(substance);
  });
}

async function fetchLabelPage(skip: number): Promise<FdaLabel[]> {
  const url = `https://api.fda.gov/drug/label.json?search=${FDA_LABEL_SEARCH}&limit=${PAGE_SIZE}&skip=${skip}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FDA label fetch failed (${res.status}) at skip=${skip}`);
  }
  const data = (await res.json()) as { results?: FdaLabel[] };
  return data.results ?? [];
}

async function main() {
  const dataPath = resolve(process.cwd(), "data/otc_medications.json");
  const starter = JSON.parse(readFileSync(dataPath, "utf-8")) as StarterDatabase;

  const starterBySubstance = new Map<string, StarterMedication>();
  for (const med of starter.medications) {
    starterBySubstance.set(normalizeSubstance(med.name), med);
  }

  const accumulators = new Map<string, IngredientAccumulator>();
  let labelsScanned = 0;

  console.log("Fetching OTC labels from openFDA Drug Label API…");
  for (let skip = 0; skip < MAX_LABELS; skip += PAGE_SIZE) {
    const page = await fetchLabelPage(skip);
    if (page.length === 0) break;
    labelsScanned += page.length;

    for (const label of page) {
      if (isHomeopathicLabel(label)) continue;

      for (const raw of label.openfda?.substance_name ?? []) {
        const substance = normalizeSubstance(raw);
        if (!substance || substance.length < 3) continue;

        let acc = accumulators.get(substance);
        if (!acc) {
          acc = {
            substance,
            count: 0,
            purpose: [],
            usedFor: [],
            sideEffects: [],
            doNotUseIf: [],
            interactions: [],
            seekCareIf: [],
            brandExamples: new Set(),
            setId: label.set_id,
          };
          accumulators.set(substance, acc);
        }

        acc.count += 1;
        if (label.purpose) acc.purpose.push(...label.purpose);
        if (label.indications_and_usage) acc.usedFor.push(...label.indications_and_usage);
        if (label.adverse_reactions) acc.sideEffects.push(...label.adverse_reactions);
        if (label.do_not_use) acc.doNotUseIf.push(...label.do_not_use);
        if (label.warnings) acc.doNotUseIf.push(...label.warnings);
        if (label.drug_interactions) acc.interactions.push(...label.drug_interactions);
        if (label.stop_use) acc.seekCareIf.push(...label.stop_use);
        for (const brand of label.openfda?.brand_name ?? []) {
          if (brand && brand.length < 80) acc.brandExamples.add(brand);
        }
      }
    }

    process.stdout.write(
      `  scanned ${labelsScanned} labels → ${accumulators.size} substances\r`
    );

    if (page.length < PAGE_SIZE) break;
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nCollected ${accumulators.size} unique substances.`);

  const selected = [...accumulators.values()]
    .filter(
      (a) =>
        a.count >= MIN_FREQUENCY ||
        findStarterMatch(a.substance, starterBySubstance, starter.medications)
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_INGREDIENTS);

  const outputMap = new Map<string, OutputMedication>();

  for (const acc of selected) {
    const starterMed = findStarterMatch(
      acc.substance,
      starterBySubstance,
      starter.medications
    );
    const med = buildFromAccumulator(acc, starterMed);
    if (isHomeopathicOrHomeRemedy(med)) continue;
    outputMap.set(med.id, med);
  }

  for (const med of starter.medications) {
    if (!outputMap.has(med.id)) {
      outputMap.set(med.id, {
        ...med,
        substanceName: normalizeSubstance(med.name),
        fdaLabelCount: 0,
      });
    }
  }

  const medications = filterConventionalOtcMedications(
    [...outputMap.values()].sort((a, b) => a.name.localeCompare(b.name))
  );

  writeFileSync(
    dataPath,
    JSON.stringify(
      {
        medications,
        symptomLookup: starter.symptomLookup,
        updatedAt: new Date().toISOString().slice(0, 10),
        sources: {
          layer1:
            "ClinMedFind conventional OTC symptom guide (homeopathic and home remedies excluded)",
          layer2: "openFDA NDC Directory (brand/generic products)",
        },
        stats: {
          activeIngredients: medications.length,
          starterIngredients: medications.length,
          fdaLabelsScanned: labelsScanned,
        },
      },
      null,
      2
    )
  );

  console.log(
    `Wrote ${medications.length} conventional OTC active ingredients to ${dataPath}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
