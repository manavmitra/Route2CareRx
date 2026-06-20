export type Locale = "en" | "es";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export const LOCALE_STORAGE_KEY = "route2carerx-locale";

export type TranslationDict = Record<string, string>;

export const en: TranslationDict = {
  "nav.clinics": "Find Clinics",
  "nav.medications": "OTC Medications",
  "nav.resources": "Additional Resources",
  "nav.main": "Main navigation",
  "lang.switch": "Language",

  "clinics.eyebrow": "Healthcare access for everyone",
  "clinics.title": "Find free & low-cost clinics near you",
  "clinics.subtitle":
    "Search federally funded community health centers, sliding-fee clinics, and UC Davis student-run clinics — no insurance required.",
  "clinics.step1": "Enter your ZIP code and search radius.",
  "clinics.step2": "Browse nearby clinics with services, hours, and contact info.",
  "clinics.step3": "Call ahead to confirm eligibility and hours.",
  "clinics.howItWorks": "How it works",

  "search.zipLabel": "Your ZIP Code",
  "search.zipHint": "Enter any US ZIP code, including territories",
  "search.zipPlaceholder": "e.g. 90210",
  "search.radiusLabel": "Search Radius",
  "search.radiusMiles": "{n} miles",
  "search.submit": "Find Clinics",
  "search.searching": "Searching…",
  "search.formLabel": "Search for clinics by ZIP code",
  "search.results": "{count} clinic(s) found",
  "search.within": "Within {radius} miles of {location}",
  "search.noResults": "No clinics found in this radius.",
  "search.noResultsHintPrefix":
    "Try expanding your search radius or browse our",
  "search.noResultsHintSuffix":
    "for free and charitable clinics in your area.",
  "search.moreOptions": "Need more options?",
  "search.browseResources": "Browse additional resources ↗",
  "search.additionalResources": "additional resources",

  "med.eyebrow": "Patient education",
  "med.title": "Over-the-counter medication guide",
  "med.subtitle":
    "Conventional OTC medications only — search by symptom for guidance, or find nearby pharmacies and drugstores by ZIP code.",
  "med.disclaimerLead": "Not medical advice and not a prescription.",
  "med.disclaimerBody":
    "This guide is for education only and does not prescribe medications or replace a prescription from a licensed provider. Always read the Drug Facts label and ask a pharmacist or clinician if you are pregnant, elderly, take prescriptions, or are treating a child.",
  "med.drugInfo": "Standard drug info:",
  "med.symptomTitle": "Search by symptom",
  "med.symptomDesc":
    "Conventional over-the-counter active ingredients only — no homeopathic products or home remedies.",
  "med.storesTitle": "Find stores near you",
  "med.storesDesc":
    "Enter your ZIP code to find nearby pharmacies and drugstores where you can buy OTC medications.",

  "otc.symptomLabel": "What symptom do you have?",
  "otc.symptomPlaceholder": "Select a symptom…",
  "otc.symptomHint":
    "Choose from {count} common symptoms to see recommended OTC options and safety information.",
  "otc.refineLabel": "Refine results (optional)",
  "otc.refinePlaceholder": "e.g. ibuprofen, nasal spray…",
  "otc.guidanceFor": "Guidance for: {symptom}",
  "otc.considerFirst": "Usually consider first",
  "otc.otherOptions": "Other options",
  "otc.avoidRedFlags": "Avoid / seek care if…",
  "otc.matched": "{count} medication(s) matched for this symptom",
  "otc.noMatch": "No medications match your filters.",
  "otc.noMatchHint": "Try clearing the refine search or pick a different symptom.",

  "store.find": "Find Stores",
  "store.searching": "Searching…",
  "store.formLabel": "Search for pharmacies and drugstores by ZIP code",
  "store.found": "{count} store(s) found",
  "store.within": "Pharmacies & drugstores within {radius} miles of {location}",
  "store.noResults": "No pharmacies found in this radius.",
  "store.noResultsHint":
    "Try expanding your radius. Grocery stores, Walmart, and Target also sell OTC medications even if not listed here.",
  "store.source":
    "Results combine NPPES (NPI Registry), OpenStreetMap, HRSA health centers, and Google Places when configured. Duplicates are merged by location. Call ahead to confirm hours.",
  "store.sourcesLabel": "Sources in this search: {sources}",
  "store.moreResources": "More pharmacy & clinic directories",
  "store.moreResourcesDesc":
    "National directories for charitable clinics, health center pharmacies, and comprehensive pharmacy listings.",
  "store.call": "Call {phone}",
  "store.type.pharmacy": "Retail pharmacy",
  "store.type.drugstore": "Pharmacy",
  "store.type.clinic_pharmacy": "Clinic / health center pharmacy",
  "store.source.nppes": "NPPES (NPI Registry)",
  "store.source.openstreetmap": "OpenStreetMap",
  "store.source.hrsa_clinic": "HRSA health center",
  "store.source.google_places": "Google Places",

  "resources.eyebrow": "More ways to get care",
  "resources.title": "Additional resources",
  "resources.subtitle":
    "Trusted national directories to help you find free and low-cost care beyond our clinic search — charitable clinics, cancer screening, mental health, and more.",
  "resources.heading": "Additional Resources",
  "resources.desc":
    "These trusted directories can help you find more free and low-cost care options, including charitable clinics, cancer screening, and mental health services.",

  "card.hours": "Hours of Operation",
  "card.noHrsaHours": "No HRSA hours on file for this site.",
  "card.dailySchedule": "Daily schedule",
  "card.services": "Services Offered",
  "card.servicesNote":
    "Based on HRSA grant programs and site type — call to confirm specific services.",
  "card.servicesNoteUcDavis":
    "From UC Davis community clinic listings — call to confirm specific services.",
  "card.setting": "Setting:",
  "card.call": "Call {phone}",
  "card.website": "Visit website ↗",
  "card.directions": "Get directions ↗",
  "card.callConfirm": "Call the clinic to confirm when they are open.",
  "card.tryExternal":
    " Try FreeClinics.com or NAFC for charitable clinics that may list daily hours.",

  "cost.free": "Free",
  "cost.sliding": "Sliding Fee Scale",
  "cost.low": "Low Cost",
  "cost.freeDesc": "No charge for eligible patients",
  "cost.slidingDesc": "Fees based on income — may be free for low-income patients",
  "cost.lowDesc": "Affordable care options available",

  "source.hrsaFqhc": "HRSA Community Health Center (FQHC)",
  "source.hrsaLookalike": "HRSA Health Center Look-Alike",
  "source.cmsRural": "CMS Rural Health Clinic",
  "source.ucDavis": "UC Davis Student-Run / Partner Clinic",

  "hours.perWeek": "Operating hours per week",
  "hours.perWeekValue": "{hours} hours/week (HRSA reported)",
  "hours.schedule": "Operating schedule",
  "hours.calendar": "Operating calendar",
  "hours.hrsaFootnote":
    "HRSA reports total weekly hours and schedule type — not daily Mon–Sun open/close times. Call the clinic to confirm today's hours.",
  "hours.ucDavisFootnote":
    "Hours from the UC Davis student-run clinic directory. Schedules vary — call to confirm before visiting.",
  "hours.dailyFootnote":
    "Daily hours from an external directory. Verify with the clinic before visiting.",

  "dist.lessThan": "Less than 0.1 mi",
  "dist.mi": "{n} mi",
  "dist.roundMi": "{n} mi",

  "footer.data":
    "Clinic data from HRSA Health Center Service Delivery Sites. OTC active ingredients from openFDA Drug Labels and DailyMed; product listings from openFDA NDC Directory; store locations from CMS NPI Registry. Route2CareRx is not affiliated with HRSA or any healthcare provider.",
  "footer.verify":
    "Verify clinic services and medication information directly with providers and product labels. For emergencies, call 911.",

  "errors.invalidZip": "Please enter a valid 5-digit ZIP code.",
  "errors.network": "Network error. Please check your connection and try again.",
  "errors.generic": "Something went wrong. Please try again.",
  "errors.zipNotFound":
    "ZIP code not found. Please enter a valid US ZIP code (including territories).",
};

export const es: TranslationDict = {
  "nav.clinics": "Buscar clínicas",
  "nav.medications": "Medicamentos OTC",
  "nav.resources": "Recursos adicionales",
  "nav.main": "Navegación principal",
  "lang.switch": "Idioma",

  "clinics.eyebrow": "Acceso a la salud para todos",
  "clinics.title": "Encuentre clínicas gratuitas y de bajo costo cerca de usted",
  "clinics.subtitle":
    "Busque centros comunitarios de salud financiados federalmente, clínicas con tarifas escalonadas y clínicas estudiantiles de UC Davis — no se requiere seguro.",
  "clinics.step1": "Ingrese su código postal y radio de búsqueda.",
  "clinics.step2":
    "Explore clínicas cercanas con servicios, horarios e información de contacto.",
  "clinics.step3": "Llame con anticipación para confirmar elegibilidad y horarios.",
  "clinics.howItWorks": "Cómo funciona",

  "search.zipLabel": "Su código postal",
  "search.zipHint": "Ingrese cualquier código postal de EE. UU., incluidos territorios",
  "search.zipPlaceholder": "ej. 90210",
  "search.radiusLabel": "Radio de búsqueda",
  "search.radiusMiles": "{n} millas",
  "search.submit": "Buscar clínicas",
  "search.searching": "Buscando…",
  "search.formLabel": "Buscar clínicas por código postal",
  "search.results": "{count} clínica(s) encontrada(s)",
  "search.within": "Dentro de {radius} millas de {location}",
  "search.noResults": "No se encontraron clínicas en este radio.",
  "search.noResultsHintPrefix":
    "Intente ampliar el radio de búsqueda o explore nuestros",
  "search.noResultsHintSuffix":
    "para clínicas gratuitas y benéficas en su área.",
  "search.moreOptions": "¿Necesita más opciones?",
  "search.browseResources": "Ver recursos adicionales ↗",
  "search.additionalResources": "recursos adicionales",

  "med.eyebrow": "Educación para pacientes",
  "med.title": "Guía de medicamentos de venta libre",
  "med.subtitle":
    "Solo medicamentos OTC convencionales — busque por síntoma o encuentre farmacias cercanas por código postal.",
  "med.disclaimerLead": "No es consejo médico ni una receta.",
  "med.disclaimerBody":
    "Esta guía es solo para educación y no prescribe medicamentos ni reemplaza una receta de un proveedor autorizado. Siempre lea la etiqueta de Drug Facts y consulte a un farmacéutico o médico si está embarazada, es mayor, toma recetas o trata a un niño.",
  "med.drugInfo": "Información estándar del medicamento:",
  "med.symptomTitle": "Buscar por síntoma",
  "med.symptomDesc":
    "Solo ingredientes activos OTC convencionales — sin productos homeopáticos ni remedios caseros.",
  "med.storesTitle": "Encontrar tiendas cerca de usted",
  "med.storesDesc":
    "Ingrese su código postal para encontrar farmacias y droguerías cercanas donde comprar medicamentos OTC.",

  "otc.symptomLabel": "¿Qué síntoma tiene?",
  "otc.symptomPlaceholder": "Seleccione un síntoma…",
  "otc.symptomHint":
    "Elija entre {count} síntomas comunes para ver opciones OTC recomendadas e información de seguridad.",
  "otc.refineLabel": "Refinar resultados (opcional)",
  "otc.refinePlaceholder": "ej. ibuprofeno, spray nasal…",
  "otc.guidanceFor": "Orientación para: {symptom}",
  "otc.considerFirst": "Considere primero",
  "otc.otherOptions": "Otras opciones",
  "otc.avoidRedFlags": "Evite / busque atención si…",
  "otc.matched": "{count} medicamento(s) para este síntoma",
  "otc.noMatch": "Ningún medicamento coincide con sus filtros.",
  "otc.noMatchHint": "Borre la búsqueda o elija otro síntoma.",

  "store.find": "Buscar tiendas",
  "store.searching": "Buscando…",
  "store.formLabel": "Buscar farmacias y droguerías por código postal",
  "store.found": "{count} tienda(s) encontrada(s)",
  "store.within": "Farmacias y droguerías dentro de {radius} millas de {location}",
  "store.noResults": "No se encontraron farmacias en este radio.",
  "store.noResultsHint":
    "Intente ampliar el radio. Supermercados, Walmart y Target también venden medicamentos OTC.",
  "store.source":
    "Resultados combinados de NPPES (Registro NPI), OpenStreetMap, centros HRSA y Google Places si está configurado. Los duplicados se fusionan por ubicación. Llame para confirmar horarios.",
  "store.sourcesLabel": "Fuentes en esta búsqueda: {sources}",
  "store.moreResources": "Más directorios de farmacias y clínicas",
  "store.moreResourcesDesc":
    "Directorios nacionales para clínicas benéficas, farmacias de centros de salud y listados completos de farmacias.",
  "store.call": "Llamar {phone}",
  "store.type.pharmacy": "Farmacia retail",
  "store.type.drugstore": "Farmacia",
  "store.type.clinic_pharmacy": "Farmacia de clínica / centro de salud",
  "store.source.nppes": "NPPES (Registro NPI de CMS)",
  "store.source.openstreetmap": "OpenStreetMap",
  "store.source.hrsa_clinic": "Centro de salud HRSA",
  "store.source.google_places": "Google Places",

  "resources.eyebrow": "Más formas de obtener atención",
  "resources.title": "Recursos adicionales",
  "resources.subtitle":
    "Directorios nacionales confiables para encontrar atención gratuita y de bajo costo — clínicas benéficas, detección de cáncer, salud mental y más.",
  "resources.heading": "Recursos adicionales",
  "resources.desc":
    "Estos directorios confiables pueden ayudarle a encontrar más opciones de atención gratuita y de bajo costo, incluidas clínicas benéficas, detección de cáncer y servicios de salud mental.",

  "card.hours": "Horario de atención",
  "card.noHrsaHours": "No hay horarios HRSA registrados para este sitio.",
  "card.dailySchedule": "Horario diario",
  "card.services": "Servicios ofrecidos",
  "card.servicesNote":
    "Según programas HRSA y tipo de sitio — llame para confirmar servicios específicos.",
  "card.servicesNoteUcDavis":
    "Según listados de clínicas comunitarias de UC Davis — llame para confirmar servicios.",
  "card.setting": "Entorno:",
  "card.call": "Llamar {phone}",
  "card.website": "Visitar sitio web ↗",
  "card.directions": "Cómo llegar ↗",
  "card.callConfirm": "Llame a la clínica para confirmar horarios.",
  "card.tryExternal":
    " Pruebe FreeClinics.com o NAFC para clínicas benéficas con horarios diarios.",

  "cost.free": "Gratis",
  "cost.sliding": "Tarifa escalonada",
  "cost.low": "Bajo costo",
  "cost.freeDesc": "Sin cargo para pacientes elegibles",
  "cost.slidingDesc":
    "Tarifas según ingresos — puede ser gratis para pacientes de bajos ingresos",
  "cost.lowDesc": "Opciones de atención asequibles disponibles",

  "source.hrsaFqhc": "Centro comunitario de salud HRSA (FQHC)",
  "source.hrsaLookalike": "Centro de salud tipo Look-Alike HRSA",
  "source.cmsRural": "Clínica rural CMS",
  "source.ucDavis": "Clínica estudiantil / asociada UC Davis",

  "hours.perWeek": "Horas de operación por semana",
  "hours.perWeekValue": "{hours} horas/semana (reportado por HRSA)",
  "hours.schedule": "Horario operativo",
  "hours.calendar": "Calendario operativo",
  "hours.hrsaFootnote":
    "HRSA reporta horas semanales totales y tipo de horario — no horarios diarios Lun–Dom. Llame para confirmar.",
  "hours.ucDavisFootnote":
    "Horarios del directorio de clínicas estudiantiles de UC Davis. Varían — llame antes de visitar.",
  "hours.dailyFootnote":
    "Horario diario de un directorio externo. Verifique con la clínica antes de visitar.",

  "dist.lessThan": "Menos de 0.1 mi",
  "dist.mi": "{n} mi",
  "dist.roundMi": "{n} mi",

  "footer.data":
    "Datos de clínicas de HRSA. Ingredientes OTC de openFDA y DailyMed; productos del Directorio NDC de openFDA; tiendas del Registro NPI de CMS. Route2CareRx no está afiliado con HRSA ni ningún proveedor de salud.",
  "footer.verify":
    "Verifique servicios e información de medicamentos directamente con proveedores y etiquetas. En emergencias, llame al 911.",

  "errors.invalidZip": "Ingrese un código postal válido de 5 dígitos.",
  "errors.network": "Error de red. Verifique su conexión e intente de nuevo.",
  "errors.generic": "Algo salió mal. Intente de nuevo.",
  "errors.zipNotFound":
    "Código postal no encontrado. Ingrese un código postal válido de EE. UU. (incluidos territorios).",
};

export const symptomLabelsEs: Record<string, string> = {
  "Fever or mild pain": "Fiebre o dolor leve",
  "Inflammatory pain, cramps, muscle aches": "Dolor inflamatorio, calambres, dolores musculares",
  "Seasonal allergies": "Alergias estacionales",
  "Stuffy nose from cold/allergies": "Congestión nasal por resfriado/alergias",
  "Dry cough": "Tos seca",
  "Chest congestion/productive cough": "Congestión en el pecho/tos con flema",
  "Sore throat": "Dolor de garganta",
  "Watery diarrhea": "Diarrea acuosa",
  Constipation: "Estreñimiento",
  "Gas/bloating": "Gases/hinchazón",
  "Occasional heartburn": "Acidez ocasional",
  "Motion sickness": "Mareo por movimiento",
  "Itchy rash/insect bites": "Sarpullido con picazón/picaduras de insectos",
  "Athlete's foot/ringworm/jock itch": "Pie de atleta/tiña/infección inguinal",
  "Mild acne": "Acné leve",
  "Minor cut/scrape": "Corte/raspadura menor",
  "Dry eyes": "Ojos secos",
  "Insomnia / trouble sleeping": "Insomnio / dificultad para dormir",
  "Minor sunburn": "Quemadura solar leve",
  Hemorrhoids: "Hemorroides",
  "Head lice": "Piojos",
  "Smoking cessation": "Dejar de fumar",
  "Traveler's diarrhea prevention": "Prevención de diarrea del viajero",
};

export const resourceLabelsEs: Record<
  string,
  { description: string; category: string }
> = {
  "FreeClinics.com": {
    description:
      "Clínicas gratuitas y basadas en ingresos — algunas incluyen horarios diarios",
    category: "Clínicas gratuitas y benéficas",
  },
  "NAFC Find a Clinic": {
    description: "Más de 1,400 clínicas gratuitas y benéficas para sin seguro",
    category: "Clínicas gratuitas y benéficas",
  },
  "CDC Breast & Cervical Cancer Screening": {
    description: "Detección de cáncer gratuita o de bajo costo para mujeres elegibles",
    category: "Detección de cáncer",
  },
  "SAMHSA FindTreatment.gov": {
    description: "Proveedores de salud mental y tratamiento de sustancias",
    category: "Salud mental y uso de sustancias",
  },
  "HRSA Find a Health Center": {
    description: "Búsqueda oficial de HRSA de centros comunitarios de salud",
    category: "Centros comunitarios de salud",
  },
};

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict = locale === "es" ? es : en;
  let text = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export function translateApiError(locale: Locale, message: string): string {
  const map: Record<string, string> = {
    "Please enter a valid 5-digit US ZIP code.": "errors.invalidZip",
    "Please enter a valid 5-digit ZIP code.": "errors.invalidZip",
    "Network error. Please check your connection and try again.": "errors.network",
    "Something went wrong. Please try again.": "errors.generic",
    "Unable to search clinics. Please try again.": "errors.generic",
    "ZIP code not found. Please enter a valid US ZIP code (including territories).":
      "errors.zipNotFound",
    "Unable to search stores right now. Please try again.": "errors.generic",
    "Unable to search stores. Please try again.": "errors.generic",
  };
  const key = map[message];
  return key ? translate(locale, key) : message;
}

export function symptomLabel(locale: Locale, symptom: string): string {
  if (locale === "es") return symptomLabelsEs[symptom] ?? symptom;
  return symptom;
}
