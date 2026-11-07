import { AgeGroup, CatGender, CatStatus } from './cat.models';

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
