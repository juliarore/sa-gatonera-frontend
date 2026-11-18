import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { toDisplayDate } from './utils/date';
import {
  AdminCatDetail,
  AdminCatsPage,
  AdminCatsQuery,
  AdoptionGroupMate,
  Characteristic,
  CatImage,
  CreateCatRequest,
  FeaturedSummary,
  UpdateCatRequest,
} from './cat.models';

function toDisplayDetail(cat: AdminCatDetail): AdminCatDetail {
  return {
    ...cat,
    birthDate: toDisplayDate(cat.birthDate),
    entryDate: toDisplayDate(cat.entryDate),
  };
}

@Injectable({ providedIn: 'root' })
export class AdminCatsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/cats`;
  private readonly characteristicsUrl = `${environment.apiUrl}/admin/characteristics`;

  list(query: AdminCatsQuery): Observable<AdminCatsPage> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<AdminCatsPage>(this.url, { params }).pipe(
      map((page) => ({
        ...page,
        items: page.items.map((cat) => ({
          ...cat,
          birthDate: toDisplayDate(cat.birthDate),
          entryDate: toDisplayDate(cat.entryDate),
        })),
      })),
    );
  }

  getById(id: string): Observable<AdminCatDetail> {
    return this.http
      .get<AdminCatDetail>(`${this.url}/${encodeURIComponent(id)}`)
      .pipe(map(toDisplayDetail));
  }

  update(id: string, body: UpdateCatRequest): Observable<AdminCatDetail> {
    return this.http
      .patch<AdminCatDetail>(`${this.url}/${encodeURIComponent(id)}`, body)
      .pipe(map(toDisplayDetail));
  }

  create(body: CreateCatRequest): Observable<AdminCatDetail> {
    return this.http.post<AdminCatDetail>(this.url, body).pipe(map(toDisplayDetail));
  }

  getFeaturedSummary(): Observable<FeaturedSummary> {
    return this.http.get<FeaturedSummary>(`${this.url}/featured-summary`);
  }

  uploadImage(catId: string, file: File): Observable<CatImage> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<CatImage>(`${this.url}/${encodeURIComponent(catId)}/images`, body);
  }

  updateImageAltText(catId: string, imageId: string, altText: string): Observable<CatImage> {
    return this.http.patch<CatImage>(
      `${this.url}/${encodeURIComponent(catId)}/images/${encodeURIComponent(imageId)}`,
      { altText },
    );
  }

  moveImage(catId: string, imageId: string, position: number): Observable<CatImage[]> {
    return this.http.patch<CatImage[]>(
      `${this.url}/${encodeURIComponent(catId)}/images/${encodeURIComponent(imageId)}/position`,
      { position },
    );
  }

  deleteImage(catId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${encodeURIComponent(catId)}/images/${encodeURIComponent(imageId)}`,
    );
  }

  getCharacteristics(): Observable<Characteristic[]> {
    return this.http.get<Characteristic[]>(this.characteristicsUrl);
  }

  getPairedCatOptions(catId?: string): Observable<AdoptionGroupMate[]> {
    return this.http.get<AdoptionGroupMate[]>(`${this.url}/paired-cat-options`, {
      params: catId ? new HttpParams().set('catId', catId) : undefined,
    });
  }
}
