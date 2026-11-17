import {
  ActivityLevel,
  AgeGroup,
  CatFieldError,
  CatGender,
  CatStatus,
  Compatibility,
} from './cat.models';

export const PAGE_SIZE = 10;

export const STATUS_LABELS: Record<CatStatus, string> = {
  available: 'En adopció',
  in_foster: 'En acollida',
  reserved: 'Reservat',
  adopted: 'Adoptat',
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  kitten: 'Cadell',
  young: 'Jove',
  adult: 'Adult',
  senior: 'Sènior',
};

export const GENDER_LABELS: Record<CatGender, string> = {
  male: 'Mascle',
  female: 'Femella',
};

export const VISIBILITY_LABELS = {
  visible: 'Visible',
  hidden: 'No visible',
} as const;

export const URGENT_LABEL = 'Urgent';

export const STATUS_OPTIONS = (Object.entries(STATUS_LABELS) as [CatStatus, string][]).map(
  ([value, label]) => ({ value, label }),
);

export const AGE_GROUP_RANGE_LABELS: Record<AgeGroup, string> = {
  kitten: "Menys d'1 any",
  young: "D'1 a 2 anys",
  adult: 'De 2 a 7 anys',
  senior: '7 anys o més',
};

export const AGE_GROUP_OPTIONS = (
  Object.entries(AGE_GROUP_RANGE_LABELS) as [AgeGroup, string][]
).map(([value, label]) => ({ value, label }));

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  low: 'Tranquil',
  medium: 'Normal',
  high: 'Actiu',
};

export const COMPATIBILITY_LABELS: Record<Compatibility, string> = {
  yes: 'Sí',
  no: 'No',
  unknown: 'Es desconeix',
};

export const CAT_DETAIL_TEXT = {
  backToList: 'Tornar al llistat',
  featured: 'Destacat',
  approximate: 'aprox.',
  yes: 'Sí',
  no: 'No',
  general: {
    title: 'Informació general',
    gender: 'Sexe',
    birthDate: 'Data de naixement',
    entryDate: "Data d'entrada",
    vaccinated: 'Vacunat',
    sterilized: 'Esterilitzat',
    activityLevel: "Nivell d'activitat",
    visibility: 'Visibilitat',
    adoptionFee: "Cost d'adopció",
  },
  compatibility: {
    title: 'Compatibilitat',
    cats: 'Gats',
    dogs: 'Gossos',
    children: 'Infants',
  },
  character: {
    title: 'Caràcter',
    empty: 'Sense característiques assignades',
  },
  story: { title: 'Història' },
  health: {
    title: 'Salut i necessitats',
    healthStatus: 'Estat de salut',
    specialNeeds: 'Necessitats especials',
  },
  group: {
    title: 'Adopció conjunta',
    intro: "S'ha d'adoptar juntament amb:",
  },
  edit: 'Editar',
  editHeading: 'Editar',
  saved: 'Canvis desats',
  closeMessage: 'Tanca el missatge',
  badRequest:
    "No s'han pogut desar els canvis perquè alguna dada no és vàlida. Revisa el formulari.",
  saveError: "No s'han pogut desar els canvis. Torna-ho a provar.",
  loading: 'Carregant el gat...',
  notFound: "No s'ha trobat aquest gat.",
  error: "No s'ha pogut carregar el gat. Torna-ho a provar.",
  retry: 'Reintentar',
} as const;

export const CAT_FORM_TEXT = {
  requiredNote: 'Els camps marcats amb * són obligatoris.',
  summary: 'Revisa els camps marcats',
  name: 'Nom',
  status: 'Estat',
  statusHelp: "Només es mostra a la web pública si l'estat és «En adopció».",
  urgent: 'Adopció urgent',
  featured: "Destacar a la pàgina d'inici",
  featuredHelp: 'Es poden destacar com a màxim 3 gats.',
  feeNote: "Depèn del sexe i de l'esterilització. S'actualitza en desar.",
  birthDateEstimated: 'Data de naixement aproximada',
  errors: {
    required: 'Aquest camp és obligatori.',
    nameMaxLength: 'El nom no pot tenir més de 100 caràcters.',
    namePattern: 'El nom només pot contenir lletres, espais, guions, apòstrofs i punts.',
    invalidDate: 'Introdueix una data vàlida.',
    characteristicsRequired: 'Selecciona almenys una característica.',
  },
  pairedWith: 'Adopció conjunta amb',
  pairedNone: 'Cap',
  pairedHelp: 'Només es poden emparellar dos gats.',
  save: 'Desa els canvis',
  saving: 'Desant...',
  cancel: 'Cancel·la',
} as const;

export const CAT_API_FIELD_ERRORS: Partial<Record<string, CatFieldError>> = {
  FEATURED_LIMIT_REACHED: {
    field: 'isFeatured',
    message: "Ja hi ha 3 gats destacats. Desmarca'n un abans de destacar aquest.",
  },
  PAIRED_CAT_TAKEN: {
    field: 'pairedCatId',
    message: "Aquest gat ja té una adopció conjunta amb un altre. Separa'ls primer.",
  },
  PAIRED_CAT_ADOPTED: {
    field: 'pairedCatId',
    message: 'No es pot emparellar amb un gat adoptat.',
  },
  UNKNOWN_CHARACTERISTICS: {
    field: 'characteristicIds',
    message: 'Alguna de les característiques ja no existeix. Recarrega la pàgina.',
  },
};
