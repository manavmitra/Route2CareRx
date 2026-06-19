export interface OtcMedication {
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
  /** Uppercase FDA substance name for NDC product lookups */
  substanceName?: string;
  /** How many OTC labels in openFDA reference this ingredient */
  fdaLabelCount?: number;
}

export interface OtcProduct {
  ndc: string;
  brandName: string | null;
  genericName: string;
  dosageForm: string | null;
  route: string | null;
  strength: string;
  manufacturer: string;
  marketingCategory: string | null;
  packageDescription: string | null;
}

export interface SymptomLookup {
  symptom: string;
  considerFirst: string;
  otherOptions: string;
  avoidRedFlags: string;
  notes: string;
}

export interface OtcDatabase {
  medications: OtcMedication[];
  symptomLookup: SymptomLookup[];
  updatedAt: string;
  sources?: {
    layer1: string;
    layer2: string;
  };
  stats?: {
    activeIngredients: number;
    starterIngredients: number;
    fdaLabelsScanned: number;
  };
}

export interface OtcProductSearchResponse {
  substance: string;
  total: number;
  products: OtcProduct[];
  source: string;
}
