import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AgeGroup,
  CatCharacteristic,
  CatGender,
  CatsSort,
  Compatibility,
  CompatibleWith,
} from './cat.models';

export interface PublicCat {
  id: string;
  slug: string;
  name: string;
  gender: CatGender;
  ageLabel: string;
  ageGroup: AgeGroup;
  isUrgent: boolean;
  hasJointAdoption: boolean;
  compatibleWithCats: Compatibility;
  compatibleWithDogs: Compatibility;
  compatibleWithChildren: Compatibility;
  characteristics: CatCharacteristic[];
  coverImageUrl: string | null;
  coverImageAlt: string | null;
}

export interface PublicCatsPage {
  items: PublicCat[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PublicCatsFilters {
  gender: CatGender[];
  ageGroup: AgeGroup[];
  compatible: CompatibleWith[];
  traits: string[];
  urgent: boolean;
  joint: boolean;
  search: string;
}

export interface PublicCatsQuery extends PublicCatsFilters {
  page: number;
  pageSize: number;
  sort: CatsSort;
}

export interface PublicCharacteristic {
  code: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class PublicCatsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/cats`;

  getCats(query: PublicCatsQuery): Observable<PublicCatsPage> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      const param = Array.isArray(value) ? value.join(',') : value;
      if (param !== '' && param !== false) {
        params = params.set(key, param);
      }
    }
    return this.http.get<PublicCatsPage>(this.url, { params });
  }

  getCharacteristics(): Observable<PublicCharacteristic[]> {
    return this.http.get<PublicCharacteristic[]>(`${this.url}/characteristics`);
  }

  getFeaturedCats(): Observable<PublicCat[]> {
    return this.http.get<PublicCat[]>(`${this.url}/featured`);
  }
}
