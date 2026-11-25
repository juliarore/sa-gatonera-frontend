import { JOINT_ADOPTION_LABEL } from '../../../shared/cats/cat.constants';
import {
  ActivityLevel,
  AdminCatsSort,
  AgeGroup,
  CatFieldError,
  CatStatus,
  SortDirection,
} from './cat.models';

export const PAGE_SIZE = 10;

export const DEFAULT_SORT: AdminCatsSort = 'entryDate';
export const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';

export const SORT_COLUMNS: readonly {
  sort: AdminCatsSort;
  header: string;
  label: string;
  directions: Record<SortDirection, string>;
}[] = [
  { sort: 'name', header: 'Gat', label: 'nom', directions: { asc: 'A-Z', desc: 'Z-A' } },
  {
    sort: 'status',
    header: 'Estat',
    label: 'estat',
    directions: { asc: 'en adopció primer', desc: 'adoptats primer' },
  },
  {
    sort: 'age',
    header: 'Edat',
    label: 'edat',
    directions: { asc: 'més joves primer', desc: 'més grans primer' },
  },
  {
    sort: 'entryDate',
    header: "Data d'entrada",
    label: "data d'entrada",
    directions: { asc: 'més antics primer', desc: 'més recents primer' },
  },
  {
    sort: 'visibility',
    header: 'Visibilitat',
    label: 'visibilitat',
    directions: { asc: 'visibles primer', desc: 'no visibles primer' },
  },
];

export const STATUS_LABELS: Record<CatStatus, string> = {
  available: 'En adopció',
  in_foster: 'En acollida',
  reserved: 'Reservat',
  adopted: 'Adoptat',
};

export const AGE_GROUPS: Record<AgeGroup, { label: string; range: string }> = {
  kitten: { label: 'Cadell', range: "menys d'1 any" },
  young: { label: 'Jove', range: '1 a 2 anys' },
  adult: { label: 'Adult', range: '2 a 7 anys' },
  senior: { label: 'Sènior', range: 'més de 7 anys' },
};

export const VISIBILITY_LABELS = {
  visible: 'Visible',
  hidden: 'No visible',
} as const;

export const STATUS_OPTIONS = (Object.entries(STATUS_LABELS) as [CatStatus, string][]).map(
  ([value, label]) => ({ value, label }),
);

export const AGE_GROUP_OPTIONS = (
  Object.entries(AGE_GROUPS) as [AgeGroup, { label: string; range: string }][]
).map(([value, { label, range }]) => ({ value, label: `${label} (${range})` }));

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  low: 'Tranquil',
  medium: 'Normal',
  high: 'Actiu',
};

export const CAT_DETAIL_TEXT = {
  backToList: 'Tornar al llistat',
  featured: 'Destacat',
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
    title: JOINT_ADOPTION_LABEL,
  },
  edit: 'Editar',
  editHeading: 'Editar',
  saved: 'Canvis desats',
  created: 'Gat creat',
  closeMessage: 'Tanca el missatge',
  badRequest:
    "No s'han pogut desar els canvis perquè alguna dada no és vàlida. Revisa el formulari.",
  saveError: "No s'han pogut desar els canvis. Torna-ho a provar.",
  loading: 'Carregant el gat...',
  notFound: "No s'ha trobat aquest gat.",
  error: "No s'ha pogut carregar el gat. Torna-ho a provar.",
  retry: 'Reintentar',
} as const;

export const FEATURED_TEXT = {
  label: "Destacat a la pàgina d'inici",
  summaryNone: "Cap gat destacat. La pàgina d'inici mostrarà gats en adopció.",
  summaryFew: (count: number) =>
    `Només hi ha ${count} ${count === 1 ? 'gat destacat' : 'gats destacats'}. La pàgina d'inici completarà els que falten amb gats en adopció.`,
} as const;

export const CAT_FORM_TEXT = {
  requiredNote: 'Els camps marcats amb * són obligatoris.',
  summary: 'Revisa els camps marcats',
  name: 'Nom',
  status: 'Estat',
  urgent: 'Adopció urgent',
  featured: "Destacar a la pàgina d'inici",
  featuredUnavailableHelp: 'Només es poden destacar els gats en adopció.',
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
  save: 'Desa els canvis',
  saving: 'Desant...',
  cancel: 'Cancel·la',
} as const;

export const CAT_API_FIELD_ERRORS: Partial<Record<string, CatFieldError>> = {
  FEATURED_LIMIT_REACHED: {
    field: 'isFeatured',
    message: "Ja hi ha 3 gats destacats. Desmarca'n un abans de destacar aquest.",
  },
  FEATURED_NOT_AVAILABLE: {
    field: 'isFeatured',
    message: 'Només es poden destacar els gats en adopció.',
  },
  PAIRED_CAT_TAKEN: {
    field: 'pairedCatId',
    message: "Aquest gat ja té una adopció conjunta amb un altre. Separa'ls primer.",
  },
  PAIRED_CAT_NOT_FOUND: {
    field: 'pairedCatId',
    message: "El gat escollit per a l'adopció conjunta ja no existeix. Recarrega la pàgina.",
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

export const CAT_CREATE_TEXT = {
  heading: 'Crear gat',
  submit: 'Crea el gat',
  saving: 'Creant...',
  loading: 'Carregant el formulari...',
  loadError: "No s'ha pogut carregar el formulari. Torna-ho a provar.",
  retry: CAT_DETAIL_TEXT.retry,
  badRequest: "No s'ha pogut crear el gat perquè alguna dada no és vàlida. Revisa el formulari.",
  saveError: "No s'ha pogut crear el gat. Torna-ho a provar.",
} as const;

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
export const IMAGE_TYPES: readonly string[] = IMAGE_ACCEPT.split(',');
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const IMAGE_MAX_COUNT = 8;
export const ALT_TEXT_MIN = 10;
export const ALT_TEXT_MAX = 250;

export const IMAGE_TEXT = {
  title: 'Fotos',
  empty: 'Aquest gat encara no té fotos.',
  editPhotos: 'Editar fotos',
  cover: 'Portada',
  stripLabel: 'Fotos del gat',
  addPhotos: 'Afegir fotos',
  limit: 'Màxim de 8 fotos.',
  filesLabel: 'Fotos',
  progress: (done: number, total: number) => `Pujant ${done} de ${total}...`,
  moveBefore: (n: number) => `Mou la foto ${n} abans`,
  moveAfter: (n: number) => `Mou la foto ${n} després`,
  edit: (n: number) => `Edita el text alternatiu de la foto ${n}`,
  remove: (n: number) => `Elimina la foto ${n}`,
  uploaded: 'Foto pujada',
  altSaved: 'Text desat',
  moved: (n: number) => `Foto moguda a la posició ${n}`,
  removed: 'Foto eliminada',
  altLabel: 'Text alternatiu',
  save: 'Desa',
  confirmText: 'Segur que vols eliminar aquesta foto?',
  confirm: 'Elimina',
  cancel: 'Cancel·la',
  errors: {
    fileType: 'Les fotos han de ser JPG, PNG o WebP.',
    fileSize: 'Cada foto pot fer com a màxim 8 MB.',
    tooMany: (room: number) =>
      room === 1
        ? "Només s'ha pujat la primera foto: el màxim és de 8 fotos."
        : `Només s'han pujat les ${room} primeres fotos: el màxim és de 8 fotos.`,
    altLength: 'El text alternatiu ha de tenir entre 10 i 250 caràcters.',
    request: "No s'ha pogut completar l'acció. Torna-ho a provar.",
  },
} as const;

export const DELETE_CAT_TEXT = {
  actionFor: (name: string) => `Eliminar ${name}`,
  question: (name: string) => `Vols eliminar a ${name}? Aquesta acció no es pot desfer.`,
  confirm: 'Eliminar',
  deleting: 'Eliminant...',
  cancel: 'Cancel·lar',
  error: "No s'ha pogut eliminar el gat. Torna-ho a provar.",
  deleted: 'Gat eliminat',
  gone: 'Aquest gat ja no existeix.',
} as const;
