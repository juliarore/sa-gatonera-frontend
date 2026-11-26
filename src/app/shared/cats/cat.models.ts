export type CatGender = 'male' | 'female';

export type AgeGroup = 'kitten' | 'young' | 'adult' | 'senior';

export type CatsSort =
  'oldest' | 'recent' | 'urgent' | 'age-asc' | 'age-desc' | 'name' | 'name-desc';

export type Compatibility = 'yes' | 'no' | 'unknown';

export type CompatibleWith = 'cats' | 'dogs' | 'children';

export interface CatCharacteristic {
  id: string;
  code: string;
  label: string;
}
