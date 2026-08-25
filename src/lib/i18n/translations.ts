export type Locale = "en" | "es";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export const LOCALE_STORAGE_KEY = "route2carerx-locale";

export type TranslationDict = Record<string, string>;

export const en: TranslationDict = {
  "nav.clinics": "Clinics",
  "nav.clinics.short": "Clinics",
  "nav.medications": "Medications",
  "nav.medications.short": "Medications",
  "nav.resources": "Resources",
  "nav.resources.short": "Resources",
  "nav.main": "Main navigation",
  "lang.switch": "Language",

  "clinics.eyebrow": "Healthcare access for everyone",
  "clinics.heroTitle": "Nearby clinics",
  "clinics.heroSubtitleDefault":
    "Search by ZIP code, address, or your current location.",
  "clinics.heroSubtitleResults":
    "Showing low-cost care near {location} within {radius} miles.",
  "clinics.title": "Find free & low-cost clinics near you",
  "clinics.subtitle":
    "Search federally funded community health centers, sliding-fee clinics, and UC Davis student-run clinics — no insurance required.",
  "clinics.step1": "Search by ZIP code, address, or your current location.",
  "clinics.step2": "Browse nearby clinics with services, hours, and contact info.",
  "clinics.step3": "Call ahead to confirm eligibility and hours.",
  "clinics.howItWorks": "How it works",
  "clinics.disclaimerLead": "Costs vary by clinic.",
  "clinics.disclaimerBody":
    "Route2CareRx lists clinics that may offer free or low-cost care, but we do not set prices and are not responsible for what a clinic charges. Fees depend on your income, insurance, and services received — always call the clinic ahead of time to confirm eligibility and expected costs.",

  "search.zipLabel": "Your ZIP Code",
  "search.zipHint": "Enter any US ZIP code, including territories",
  "search.zipPlaceholder": "e.g. 90210",
  "search.radiusLabel": "Search Radius",
  "search.radiusMiles": "{n} miles",
  "search.submit": "Find Clinics",
  "search.searching": "Searching…",
  "search.formLabel": "Search for clinics by location",
  "search.modeLabel": "Search by",
  "search.modeZip": "ZIP code",
  "search.modeAddress": "Address or name",
  "search.modeLocation": "My location",
  "search.addressOrNameLabel": "Address or name",
  "search.clinicAddressOrNamePlaceholder":
    "e.g. 123 Main St, Sacramento, CA or Kaiser",
  "search.pharmacyAddressOrNamePlaceholder":
    "e.g. 123 Main St, Sacramento, CA or CVS",
  "search.addressHint":
    "Enter a street address with city and state, or a clinic/pharmacy name with city",
  "search.addressOrNameRequired":
    "Please enter an address or clinic/pharmacy name.",
  "search.locationLabel": "Your location",
  "search.useMyLocation": "Use my location",
  "search.locating": "Getting location…",
  "search.locationDetected": "Location ready",
  "search.locationHint": "Your browser will ask for permission to use GPS",
  "search.locationRequired": "Please allow location access or choose another search method.",
  "search.geoDenied": "Location access was denied. Try ZIP code or address instead.",
  "search.geoUnsupported": "Your browser does not support location services.",
  "search.filterLabel": "Filter results",
  "search.filterPlaceholder": "Search by name or address…",
  "search.filterCount": "Showing {filtered} of {total} results",
  "search.filterNoMatch": "No results match your filter. Try a different name or address.",
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
  "med.heroTitle": "OTC medications",
  "med.heroTitleSymptom": "{symptom} relief options",
  "med.heroSubtitle":
    "Search by symptom and find nearby pharmacies for over-the-counter options.",
  "med.symptomTag": "Symptom: {symptom}",
  "med.recommendedOtc": "Recommended OTC options",
  "med.recommendedOtcDesc":
    "These are common over-the-counter active ingredients that may help.",
  "med.whenToGetCare": "When to get medical care",
  "med.whenToGetCareIntro": "Seek medical care right away if you have any of the following:",
  "med.call911": "Call 911 for any life-threatening symptoms.",
  "med.findPharmacies": "Find nearby pharmacies",
  "med.title": "Over-the-counter medication guide",
  "med.subtitle":
    "Conventional OTC medications only — search by symptom for guidance, or find nearby pharmacies and drugstores by ZIP, address, or your location.",
  "med.disclaimerLead": "Not medical advice and not a prescription.",
  "med.disclaimerBody":
    "This guide is for education only and does not prescribe medications or replace a prescription from a licensed provider. Always read the Drug Facts label and ask a pharmacist or clinician if you are pregnant, elderly, take prescriptions, or are treating a child.",
  "med.drugInfo": "Standard drug info:",
  "med.symptomTitle": "Search by symptom",
  "med.symptomDesc":
    "Conventional over-the-counter active ingredients only — no homeopathic products or home remedies.",
  "med.storesTitle": "Find stores near you",
  "med.storesDesc":
    "Search by ZIP code, address, or your location to find nearby pharmacies and drugstores where you can buy OTC medications.",

  "otc.symptomLabel": "What symptom do you have?",
  "otc.symptomPlaceholder": "Select a symptom…",
  "otc.symptomHint":
    "Choose from {count} common symptoms to see recommended OTC options and safety information.",
  "otc.refineLabel": "Refine results (optional)",
  "otc.refinePlaceholder": "e.g. Tylenol, Advil, store brands…",
  "otc.exampleProducts": "Example products",
  "otc.activeIngredientLabel": "Active ingredient",
  "otc.showSafety": "Safety & side effects",
  "otc.hideSafety": "Hide safety info",
  "otc.showReferences": "FDA listings & references",
  "otc.hideReferences": "Hide listings",
  "otc.showGuidance": "Tap to expand",
  "otc.sideEffectsLabel": "Common side effects",
  "otc.doNotUseLabel": "Do not use / ask a clinician first if…",
  "otc.interactionsLabel": "Interactions & cautions",
  "otc.seekCareLabel": "Stop use & seek care if…",
  "otc.showProducts": "View FDA product listings",
  "otc.hideProducts": "Hide product listings",
  "otc.loadingProducts": "Loading product listings…",
  "otc.productCount": "{shown} of {total} products for {substance}",
  "otc.noProducts": "No consumer products found in openFDA for this ingredient.",
  "otc.productColumn": "Product",
  "otc.formColumn": "Form / strength",
  "otc.guidanceFor": "Guidance for: {symptom}",
  "otc.considerFirst": "Usually consider first",
  "otc.otherOptions": "Other options",
  "otc.avoidRedFlags": "Avoid / seek care if…",
  "otc.matched": "{count} medication(s) matched for this symptom",
  "otc.noMatch": "No medications match your filters.",
  "otc.noMatchHint": "Try clearing the refine search or pick a different symptom.",

  "store.find": "Find Stores",
  "store.searching": "Searching…",
  "store.formLabel": "Search for pharmacies and drugstores by location",
  "store.found": "{count} store(s) found",
  "store.within": "Pharmacies & drugstores within {radius} miles of {location}",
  "store.noResults": "No pharmacies found in this radius.",
  "store.noResultsHint":
    "Try expanding your radius or search a nearby ZIP code.",
  "store.source":
    "Results combine NPPES (NPI Registry), OpenStreetMap, Geofabrik California OSM and CA Board of Pharmacy data (when imported), and Google Places when configured. Only traditional retail pharmacies and drugstores are shown. Duplicates are merged by location. Call ahead to confirm hours.",
  "store.sourcesLabel": "Sources in this search: {sources}",
  "store.moreResources": "More pharmacy & clinic directories",
  "store.moreResourcesDesc":
    "National directories for charitable clinics, health center pharmacies, and comprehensive pharmacy listings.",
  "store.call": "Call {phone}",
  "store.type.pharmacy": "Retail pharmacy",
  "store.type.drugstore": "Pharmacy / drugstore",
  "store.source.nppes": "NPPES (NPI Registry)",
  "store.source.openstreetmap": "OpenStreetMap (live)",
  "store.source.geofabrik_osm": "Geofabrik California OSM",
  "store.source.ca_pharmacy_board": "CA Board of Pharmacy",
  "store.source.tx_pharmacy_board": "Texas TSBP (CSV)",
  "store.source.hrsa_clinic": "HRSA health center",
  "store.source.google_places": "Google Places",
  "store.tierVerify": "Verify OTC availability",
  "store.locationsNote":
    "Pharmacy locations come from official state licensing records and trusted public databases. Availability may vary, so call ahead to confirm.",

  "resources.eyebrow": "More ways to get care",
  "resources.exploreTitle": "Explore resources",
  "resources.exploreSubtitle":
    "Trusted directories and support services to help you access free and low-cost care beyond our clinic search.",
  "resources.categoriesTitle": "Care categories",
  "resources.categoriesDesc": "Browse resources to find the help you need.",
  "resources.popularTitle": "Popular resources",
  "resources.viewAll": "View all",
  "resources.title": "Additional resources",
  "resources.subtitle":
    "Trusted national directories to help you find free and low-cost care beyond our clinic search — charitable clinics, cancer screening, mental health, and more.",
  "resources.heading": "Additional Resources",
  "resources.desc":
    "These trusted directories can help you find more free and low-cost care options, including charitable clinics, cancer screening, and mental health services.",

  "card.hours": "Hours of Operation",
  "card.noDailyHours": "Daily hours are not available for this clinic.",
  "card.services": "Services Offered",
  "card.servicesNote":
    "Based on HRSA grant programs and site type — call to confirm specific services.",
  "card.servicesNoteUcDavis":
    "From UC Davis community clinic listings — call to confirm specific services.",
  "card.setting": "Setting:",
  "card.call": "Call {phone}",
  "card.website": "Visit website ↗",
  "card.directions": "Get directions ↗",
  "card.directionsShort": "Directions",
  "card.details": "Details",
  "card.distanceAway": "{n} miles away",
  "card.distanceAwayLess": "Less than 0.1 miles away",
  "card.hoursAvailable": "Hours listed — call to confirm",
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

  "filter.filters": "Filters",
  "filter.womensHealth": "Women's health",
  "filter.hasHours": "Has hours listed",
  "filter.slidingFee": "Sliding fee",
  "filter.sortBy": "Sort by:",
  "filter.sortDistance": "Distance",
  "filter.sortName": "Name",

  "detail.back": "Back",
  "detail.backToSearch": "Back to clinic search",
  "detail.notFound": "Clinic details are not available. Please search again and select a clinic.",
  "detail.studentRun": "Student-run",
  "detail.locationContact": "Location & contact",
  "detail.phone": "Phone",
  "detail.mapTitle": "Clinic location map",
  "detail.viewLargerMap": "View larger map",
  "detail.callClinic": "Call clinic",
  "detail.eligibility": "Eligibility & cost",
  "detail.eligibilityNote": "Call ahead to confirm eligibility, services, and expected costs.",
  "detail.whatToBring": "What to bring",
  "detail.bringId": "Photo ID (if you have one)",
  "detail.bringIncome": "Proof of income (optional, for sliding-fee scale)",
  "detail.bringInsurance": "Insurance card (optional)",
  "detail.bringMeds": "List of current medications",

  "privacy.short": "Your information is private and secure.",
  "privacy.full":
    "Your information is private and secure. We never share your personal information.",

  "footer.data":
    "Clinic data from HRSA Health Center Service Delivery Sites. OTC active ingredients from openFDA Drug Labels and DailyMed; product listings from openFDA NDC Directory; store locations from CMS NPI Registry. Route2CareRx is not affiliated with HRSA or any healthcare provider.",
  "footer.verify":
    "Verify clinic services and medication information directly with providers and product labels. For emergencies, call 911.",

  "errors.invalidZip": "Please enter a valid 5-digit ZIP code.",
  "errors.network": "Network error. Please check your connection and try again.",
  "errors.generic": "Something went wrong. Please try again.",
  "errors.zipNotFound":
    "ZIP code not found. Please enter a valid US ZIP code (including territories).",
  "errors.addressNotFound":
    "Address not found. Try a street address with city and state, or use ZIP code.",
  "errors.locationRequired":
    "Please enter a ZIP code, address, or use your location.",
  "errors.invalidLocation": "Invalid location coordinates.",
};

export const es: TranslationDict = {
  "nav.clinics": "Buscar clínicas",
  "nav.clinics.short": "Clínicas",
  "nav.medications": "Medicamentos OTC",
  "nav.medications.short": "OTC",
  "nav.resources": "Recursos adicionales",
  "nav.resources.short": "Recursos",
  "nav.main": "Navegación principal",
  "lang.switch": "Idioma",

  "clinics.eyebrow": "Acceso a la salud para todos",
  "clinics.heroTitle": "Clínicas cercanas",
  "clinics.heroSubtitleDefault":
    "Busque por código postal, dirección o su ubicación actual.",
  "clinics.heroSubtitleResults":
    "Mostrando atención de bajo costo cerca de {location} en un radio de {radius} millas.",
  "clinics.title": "Encuentre clínicas gratuitas y de bajo costo cerca de usted",
  "clinics.subtitle":
    "Busque centros comunitarios de salud financiados federalmente, clínicas con tarifas escalonadas y clínicas estudiantiles de UC Davis — no se requiere seguro.",
  "clinics.step1": "Busque por código postal, dirección o su ubicación actual.",
  "clinics.step2":
    "Explore clínicas cercanas con servicios, horarios e información de contacto.",
  "clinics.step3": "Llame con anticipación para confirmar elegibilidad y horarios.",
  "clinics.howItWorks": "Cómo funciona",
  "clinics.disclaimerLead": "Los costos varían según la clínica.",
  "clinics.disclaimerBody":
    "Route2CareRx enumera clínicas que pueden ofrecer atención gratuita o de bajo costo, pero no fijamos precios ni somos responsables de lo que cobre una clínica. Las tarifas dependen de sus ingresos, seguro y servicios recibidos — siempre llame a la clínica con anticipación para confirmar elegibilidad y costos esperados.",

  "search.zipLabel": "Su código postal",
  "search.zipHint": "Ingrese cualquier código postal de EE. UU., incluidos territorios",
  "search.zipPlaceholder": "ej. 90210",
  "search.radiusLabel": "Radio de búsqueda",
  "search.radiusMiles": "{n} millas",
  "search.submit": "Buscar clínicas",
  "search.searching": "Buscando…",
  "search.formLabel": "Buscar clínicas por ubicación",
  "search.modeLabel": "Buscar por",
  "search.modeZip": "Código postal",
  "search.modeAddress": "Dirección o nombre",
  "search.modeLocation": "Mi ubicación",
  "search.addressOrNameLabel": "Dirección o nombre",
  "search.clinicAddressOrNamePlaceholder":
    "ej. 123 Main St, Sacramento, CA o Kaiser",
  "search.pharmacyAddressOrNamePlaceholder":
    "ej. 123 Main St, Sacramento, CA o CVS",
  "search.addressHint":
    "Ingrese una dirección con ciudad y estado, o un nombre de clínica/farmacia con ciudad",
  "search.addressOrNameRequired":
    "Ingrese una dirección o un nombre de clínica/farmacia.",
  "search.locationLabel": "Su ubicación",
  "search.useMyLocation": "Usar mi ubicación",
  "search.locating": "Obteniendo ubicación…",
  "search.locationDetected": "Ubicación lista",
  "search.locationHint": "Su navegador pedirá permiso para usar GPS",
  "search.locationRequired": "Permita el acceso a la ubicación o elija otro método de búsqueda.",
  "search.geoDenied": "Acceso a ubicación denegado. Pruebe código postal o dirección.",
  "search.geoUnsupported": "Su navegador no admite servicios de ubicación.",
  "search.filterLabel": "Filtrar resultados",
  "search.filterPlaceholder": "Buscar por nombre o dirección…",
  "search.filterCount": "Mostrando {filtered} de {total} resultados",
  "search.filterNoMatch": "Ningún resultado coincide con su filtro. Pruebe otro nombre o dirección.",
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
  "med.heroTitle": "Medicamentos OTC",
  "med.heroTitleSymptom": "Opciones para {symptom}",
  "med.heroSubtitle":
    "Busque por síntoma y encuentre farmacias cercanas con opciones de venta libre.",
  "med.symptomTag": "Síntoma: {symptom}",
  "med.recommendedOtc": "Opciones OTC recomendadas",
  "med.recommendedOtcDesc":
    "Estos son ingredientes activos de venta libre comunes que pueden ayudar.",
  "med.whenToGetCare": "Cuándo buscar atención médica",
  "med.whenToGetCareIntro": "Busque atención médica de inmediato si tiene alguno de los siguientes:",
  "med.call911": "Llame al 911 ante síntomas que pongan en riesgo la vida.",
  "med.findPharmacies": "Encontrar farmacias cercanas",
  "med.title": "Guía de medicamentos de venta libre",
  "med.subtitle":
    "Solo medicamentos OTC convencionales — busque por síntoma o encuentre farmacias cercanas por código postal, dirección o ubicación.",
  "med.disclaimerLead": "No es consejo médico ni una receta.",
  "med.disclaimerBody":
    "Esta guía es solo para educación y no prescribe medicamentos ni reemplaza una receta de un proveedor autorizado. Siempre lea la etiqueta de Drug Facts y consulte a un farmacéutico o médico si está embarazada, es mayor, toma recetas o trata a un niño.",
  "med.drugInfo": "Información estándar del medicamento:",
  "med.symptomTitle": "Buscar por síntoma",
  "med.symptomDesc":
    "Solo ingredientes activos OTC convencionales — sin productos homeopáticos ni remedios caseros.",
  "med.storesTitle": "Encontrar tiendas cerca de usted",
  "med.storesDesc":
    "Busque por código postal, dirección o ubicación para encontrar farmacias y droguerías cercanas donde comprar medicamentos OTC.",

  "otc.symptomLabel": "¿Qué síntoma tiene?",
  "otc.symptomPlaceholder": "Seleccione un síntoma…",
  "otc.symptomHint":
    "Elija entre {count} síntomas comunes para ver opciones OTC recomendadas e información de seguridad.",
  "otc.refineLabel": "Refinar resultados (opcional)",
  "otc.refinePlaceholder": "ej. Tylenol, Advil, marcas de tienda…",
  "otc.exampleProducts": "Productos de ejemplo",
  "otc.activeIngredientLabel": "Ingrediente activo",
  "otc.showSafety": "Seguridad y efectos secundarios",
  "otc.hideSafety": "Ocultar información de seguridad",
  "otc.showReferences": "Listados FDA y referencias",
  "otc.hideReferences": "Ocultar listados",
  "otc.showGuidance": "Toque para expandir",
  "otc.sideEffectsLabel": "Efectos secundarios comunes",
  "otc.doNotUseLabel": "No use / consulte a un médico primero si…",
  "otc.interactionsLabel": "Interacciones y precauciones",
  "otc.seekCareLabel": "Deje de usar y busque atención si…",
  "otc.showProducts": "Ver listados de productos FDA",
  "otc.hideProducts": "Ocultar listados",
  "otc.loadingProducts": "Cargando listados…",
  "otc.productCount": "{shown} de {total} productos para {substance}",
  "otc.noProducts": "No se encontraron productos de consumo en openFDA.",
  "otc.productColumn": "Producto",
  "otc.formColumn": "Forma / concentración",
  "otc.guidanceFor": "Orientación para: {symptom}",
  "otc.considerFirst": "Considere primero",
  "otc.otherOptions": "Otras opciones",
  "otc.avoidRedFlags": "Evite / busque atención si…",
  "otc.matched": "{count} medicamento(s) para este síntoma",
  "otc.noMatch": "Ningún medicamento coincide con sus filtros.",
  "otc.noMatchHint": "Borre la búsqueda o elija otro síntoma.",

  "store.find": "Buscar tiendas",
  "store.searching": "Buscando…",
  "store.formLabel": "Buscar farmacias y droguerías por ubicación",
  "store.found": "{count} tienda(s) encontrada(s)",
  "store.within": "Farmacias y droguerías dentro de {radius} millas de {location}",
  "store.noResults": "No se encontraron farmacias en este radio.",
  "store.noResultsHint":
    "Intente ampliar el radio o buscar en un código postal cercano.",
  "store.source":
    "Resultados combinados de NPPES (Registro NPI), OpenStreetMap, Geofabrik California OSM y Junta de Farmacia de CA (si importados), y Google Places si está configurado. Solo se muestran farmacias retail y droguerías tradicionales. Los duplicados se fusionan por ubicación. Llame para confirmar horarios.",
  "store.sourcesLabel": "Fuentes en esta búsqueda: {sources}",
  "store.moreResources": "Más directorios de farmacias y clínicas",
  "store.moreResourcesDesc":
    "Directorios nacionales para clínicas benéficas, farmacias de centros de salud y listados completos de farmacias.",
  "store.call": "Llamar {phone}",
  "store.type.pharmacy": "Farmacia retail",
  "store.type.drugstore": "Farmacia / droguería",
  "store.source.nppes": "NPPES (Registro NPI de CMS)",
  "store.source.openstreetmap": "OpenStreetMap (en vivo)",
  "store.source.geofabrik_osm": "Geofabrik California OSM",
  "store.source.ca_pharmacy_board": "Junta de Farmacia de CA",
  "store.source.tx_pharmacy_board": "TSBP Texas (CSV)",
  "store.source.hrsa_clinic": "Centro de salud HRSA",
  "store.source.google_places": "Google Places",
  "store.tierVerify": "Verificar disponibilidad OTC",
  "store.locationsNote":
    "Las ubicaciones provienen de registros oficiales de licencias estatales y bases de datos públicas confiables. La disponibilidad puede variar; llame con anticipación para confirmar.",

  "resources.eyebrow": "Más formas de obtener atención",
  "resources.heroTitle": "Recursos adicionales",
  "resources.heroSubtitle":
    "Directorios confiables para clínicas gratuitas, atención benéfica, salud mental y más.",
  "resources.title": "Recursos adicionales",
  "resources.subtitle":
    "Directorios nacionales confiables para encontrar atención gratuita y de bajo costo — clínicas benéficas, detección de cáncer, salud mental y más.",
  "resources.heading": "Recursos adicionales",
  "resources.desc":
    "Estos directorios confiables pueden ayudarle a encontrar más opciones de atención gratuita y de bajo costo, incluidas clínicas benéficas, detección de cáncer y servicios de salud mental.",
  "resources.exploreTitle": "Explorar recursos",
  "resources.exploreSubtitle":
    "Directorios confiables y servicios de apoyo para acceder a atención gratuita y de bajo costo más allá de nuestra búsqueda de clínicas.",
  "resources.categoriesTitle": "Categorías de atención",
  "resources.categoriesDesc": "Explore recursos para encontrar la ayuda que necesita.",
  "resources.popularTitle": "Recursos populares",
  "resources.viewAll": "Ver todos",

  "card.hours": "Horario de atención",
  "card.noDailyHours": "No hay horario diario disponible para esta clínica.",
  "card.services": "Servicios ofrecidos",
  "card.servicesNote":
    "Según programas HRSA y tipo de sitio — llame para confirmar servicios específicos.",
  "card.servicesNoteUcDavis":
    "Según listados de clínicas comunitarias de UC Davis — llame para confirmar servicios.",
  "card.setting": "Entorno:",
  "card.call": "Llamar {phone}",
  "card.website": "Visitar sitio web ↗",
  "card.directions": "Cómo llegar ↗",
  "card.directionsShort": "Cómo llegar",
  "card.details": "Detalles",
  "card.distanceAway": "A {n} millas",
  "card.distanceAwayLess": "A menos de 0.1 millas",
  "card.hoursAvailable": "Horario disponible — llame para confirmar",
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

  "filter.filters": "Filtros",
  "filter.womensHealth": "Salud de la mujer",
  "filter.hasHours": "Con horario listado",
  "filter.slidingFee": "Tarifa escalonada",
  "filter.sortBy": "Ordenar por:",
  "filter.sortDistance": "Distancia",
  "filter.sortName": "Nombre",

  "detail.back": "Atrás",
  "detail.backToSearch": "Volver a la búsqueda",
  "detail.notFound": "Los detalles de la clínica no están disponibles. Busque de nuevo y seleccione una clínica.",
  "detail.studentRun": "Dirigida por estudiantes",
  "detail.locationContact": "Ubicación y contacto",
  "detail.phone": "Teléfono",
  "detail.mapTitle": "Mapa de la clínica",
  "detail.viewLargerMap": "Ver mapa más grande",
  "detail.callClinic": "Llamar a la clínica",
  "detail.eligibility": "Elegibilidad y costo",
  "detail.eligibilityNote": "Llame con anticipación para confirmar elegibilidad, servicios y costos esperados.",
  "detail.whatToBring": "Qué llevar",
  "detail.bringId": "Identificación con foto (si tiene)",
  "detail.bringIncome": "Comprobante de ingresos (opcional, para tarifa escalonada)",
  "detail.bringInsurance": "Tarjeta de seguro (opcional)",
  "detail.bringMeds": "Lista de medicamentos actuales",

  "privacy.short": "Su información es privada y segura.",
  "privacy.full":
    "Su información es privada y segura. Nunca compartimos su información personal.",

  "footer.data":
    "Datos de clínicas de HRSA. Ingredientes OTC de openFDA y DailyMed; productos del Directorio NDC de openFDA; tiendas del Registro NPI de CMS. Route2CareRx no está afiliado con HRSA ni ningún proveedor de salud.",
  "footer.verify":
    "Verifique servicios e información de medicamentos directamente con proveedores y etiquetas. En emergencias, llame al 911.",

  "errors.invalidZip": "Ingrese un código postal válido de 5 dígitos.",
  "errors.network": "Error de red. Verifique su conexión e intente de nuevo.",
  "errors.generic": "Algo salió mal. Intente de nuevo.",
  "errors.zipNotFound":
    "Código postal no encontrado. Ingrese un código postal válido de EE. UU. (incluidos territorios).",
  "errors.addressNotFound":
    "Dirección no encontrada. Pruebe una dirección con ciudad y estado, o use código postal.",
  "errors.locationRequired":
    "Ingrese un código postal, dirección o use su ubicación.",
  "errors.invalidLocation": "Coordenadas de ubicación no válidas.",
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
    "Please enter a ZIP code, address, or use your location.":
      "errors.locationRequired",
    "Address not found. Try a street address with city and state, or use ZIP code.":
      "errors.addressNotFound",
    "Invalid location coordinates.": "errors.invalidLocation",
    "Address must be within the United States.": "errors.addressNotFound",
  };
  const key = map[message];
  return key ? translate(locale, key) : message;
}

export function symptomLabel(locale: Locale, symptom: string): string {
  if (locale === "es") return symptomLabelsEs[symptom] ?? symptom;
  return symptom;
}
