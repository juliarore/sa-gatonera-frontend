import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatCharacteristic, CatGender, Compatibility } from './cat.models';

export interface FeaturedCat {
  name: string;
  slug: string;
  gender: CatGender;
  birthDate: string;
  isUrgent: boolean;
  isJointAdoption: boolean;
  compatibleWithCats: Compatibility;
  compatibleWithDogs: Compatibility;
  compatibleWithChildren: Compatibility;
  characteristics: CatCharacteristic[];
  coverImageUrl: string | null;
  coverImageAlt: string | null;
}

const FEATURED_CATS_LIMIT = 3;

@Injectable({ providedIn: 'root' })
export class PublicCatsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/public/cats`;

  getFeatured(): Observable<FeaturedCat[]> {
    const params = new HttpParams().set('featured', true).set('limit', FEATURED_CATS_LIMIT);
    return this.http.get<FeaturedCat[]>(this.url, { params });
  }
}
