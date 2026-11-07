import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminCatsPage, AdminCatsQuery } from './cat.models';

function toDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

@Injectable({ providedIn: 'root' })
export class AdminCatsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/cats`;

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
}
