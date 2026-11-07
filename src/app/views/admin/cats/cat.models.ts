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
