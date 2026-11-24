import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgeGroup, CatCharacteristic, CatGender, CatsSort, Compatibility } from './cat.models';

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

export interface PublicCatsQuery {
  page: number;
  pageSize: number;
  sort: CatsSort;
}

@Injectable({ providedIn: 'root' })
export class PublicCatsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/cats`;

  getCats({ page, pageSize, sort }: PublicCatsQuery): Observable<PublicCatsPage> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('sort', sort);
    return this.http.get<PublicCatsPage>(this.url, { params });
  }

  getFeaturedCats(): Observable<PublicCat[]> {
    return this.http.get<PublicCat[]>(`${this.url}/featured`);
  }
}
