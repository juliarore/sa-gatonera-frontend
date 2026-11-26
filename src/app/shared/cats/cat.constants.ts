import { AgeGroup, CatGender, Compatibility, CompatibleWith } from './cat.models';

export const GENDER_LABELS: Record<CatGender, string> = {
  male: 'Mascle',
  female: 'Femella',
};

export const AGE_GROUPS: Record<AgeGroup, { label: string; range: string }> = {
  kitten: { label: 'Cadell', range: "menys d'1 any" },
  young: { label: 'Jove', range: '1 a 2 anys' },
  adult: { label: 'Adult', range: '2 a 7 anys' },
  senior: { label: 'Sènior', range: 'més de 7 anys' },
};

export const AGE_GROUP_OPTIONS = (
  Object.entries(AGE_GROUPS) as [AgeGroup, { label: string; range: string }][]
).map(([value, { label, range }]) => ({ value, label: `${label} (${range})` }));

export const COMPATIBLE_WITH_LABELS: Record<CompatibleWith, string> = {
  cats: 'Gats',
  dogs: 'Gossos',
  children: 'Infants',
};

export const URGENT_LABEL = 'Urgent';

export const JOINT_ADOPTION_LABEL = 'Adopció conjunta';

export const COMPATIBILITY_LABELS: Record<Compatibility, string> = {
  yes: 'Sí',
  no: 'No',
  unknown: 'Es desconeix',
};

export const COMPATIBILITY_TAG_LABELS = {
  compatibleWithCats: 'Compatible amb gats',
  compatibleWithDogs: 'Compatible amb gossos',
  compatibleWithChildren: 'Compatible amb infants',
} as const;
