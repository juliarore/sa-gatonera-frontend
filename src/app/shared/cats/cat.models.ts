export type CatGender = 'male' | 'female';

export type Compatibility = 'yes' | 'no' | 'unknown';

export interface CatCharacteristic {
  id: string;
  code: string;
  label: string;
}
