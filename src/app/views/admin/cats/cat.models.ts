export type CatGender = 'male' | 'female';
export type CatStatus = 'available' | 'in_foster' | 'reserved' | 'adopted';
export type AgeGroup = 'kitten' | 'young' | 'adult' | 'senior';

export interface AdminCat {
  id: string;
  name: string;
  slug: string;
  gender: CatGender;
  birthDate: string;
  status: CatStatus;
  isUrgent: boolean;
  entryDate: string;
  ageGroup: AgeGroup;
  isVisible: boolean;
}

export interface AdminCatsPage {
  items: AdminCat[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCatsQuery {
  search?: string;
  status?: CatStatus | '';
  ageGroup?: AgeGroup | '';
  page?: number;
  limit?: number;
}

export type Compatibility = 'yes' | 'no' | 'unknown';
export type ActivityLevel = 'low' | 'medium' | 'high';

export interface AdoptionGroupMate {
  id: string;
  name: string;
}

export interface CatCharacteristic {
  id: string;
  code: string;
  label: string;
}

export interface AdminCatDetail {
  id: string;
  name: string;
  slug: string;
  gender: CatGender;
  story: string;
  entryDate: string;
  healthStatus: string;
  specialNeeds: string | null;
  birthDate: string;
  birthDateIsEstimated: boolean;
  vaccinated: boolean;
  sterilized: boolean;
  compatibleWithCats: Compatibility;
  compatibleWithDogs: Compatibility;
  compatibleWithChildren: Compatibility;
  activityLevel: ActivityLevel;
  status: CatStatus;
  isFeatured: boolean;
  isUrgent: boolean;
  adoptionGroupId: string | null;
  createdAt: string;
  updatedAt: string;
  adoptionFee: number;
  ageGroup: AgeGroup;
  isVisible: boolean;
  adoptionGroupMates: AdoptionGroupMate[];
  characteristics: CatCharacteristic[];
}

export interface UpdateCatRequest {
  name: string;
  status: CatStatus;
  isUrgent: boolean;
  isFeatured: boolean;
  gender: CatGender;
  birthDate: string;
  birthDateIsEstimated: boolean;
  entryDate: string;
  vaccinated: boolean;
  sterilized: boolean;
  activityLevel: ActivityLevel;
  compatibleWithCats: Compatibility;
  compatibleWithDogs: Compatibility;
  compatibleWithChildren: Compatibility;
  story: string;
  healthStatus: string;
  specialNeeds: string | null;
}
