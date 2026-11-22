import { CatGender, Compatibility } from './cat.models';

export const GENDER_LABELS: Record<CatGender, string> = {
  male: 'Mascle',
  female: 'Femella',
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
