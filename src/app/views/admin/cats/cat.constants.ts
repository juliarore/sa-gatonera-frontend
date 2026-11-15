import { ActivityLevel, AgeGroup, CatGender, CatStatus, Compatibility } from './cat.models';

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
  loading: 'Carregant el gat...',
  notFound: "No s'ha trobat aquest gat.",
  error: "No s'ha pogut carregar el gat. Torna-ho a provar.",
  retry: 'Reintentar',
} as const;
