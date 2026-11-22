import { CatCharacteristic, CatGender, Compatibility } from '../../../shared/cats/cat.models';

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
  isFeatured: boolean;
  entryDate: string;
  ageGroup: AgeGroup;
  isVisible: boolean;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
}

export interface AdminCatsPage {
  items: AdminCat[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeaturedSummary {
  count: number;
  max: number;
}

export interface AdminCatsQuery {
  search?: string;
  status?: CatStatus | '';
  ageGroup?: AgeGroup | '';
  page?: number;
  limit?: number;
}

export type ActivityLevel = 'low' | 'medium' | 'high';

export interface CatImage {
  id: string;
  imageUrl: string;
  altText: string;
  displayOrder: number;
}

export interface AdoptionGroupMate {
  id: string;
  name: string;
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
  images: CatImage[];
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
  characteristicIds: string[];
  pairedCatId?: string | null;
}

export interface Characteristic {
  id: string;
  code: string;
  labelMasculine: string;
  labelFeminine: string;
}

export interface CatFieldError {
  field: 'isFeatured' | 'pairedCatId' | 'characteristicIds';
  message: string;
}

export type CreateCatRequest = UpdateCatRequest;
