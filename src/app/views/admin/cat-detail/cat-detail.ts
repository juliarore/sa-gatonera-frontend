import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { AdminCatsService } from '../cats/admin-cats.service';
import {
  ACTIVITY_LEVEL_LABELS,
  CAT_DETAIL_TEXT,
  COMPATIBILITY_LABELS,
  GENDER_LABELS,
  STATUS_LABELS,
  URGENT_LABEL,
  VISIBILITY_LABELS,
} from '../cats/cat.constants';
import { AdminCatDetail } from '../cats/cat.models';
import { getAgeLabel } from '../cats/utils/age';

@Component({
  selector: 'app-cat-detail',
  imports: [RouterLink],
  templateUrl: './cat-detail.html',
  styleUrl: './cat-detail.scss',
})
export class CatDetail {
  private readonly adminCats = inject(AdminCatsService);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly retry$ = new BehaviorSubject<void>(undefined);

  protected readonly text = CAT_DETAIL_TEXT;
  protected readonly genderLabels = GENDER_LABELS;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly activityLabels = ACTIVITY_LEVEL_LABELS;
  protected readonly compatibilityLabels = COMPATIBILITY_LABELS;
  protected readonly visibilityLabels = VISIBILITY_LABELS;
  protected readonly urgentLabel = URGENT_LABEL;
  protected readonly ageLabel = getAgeLabel;

  protected readonly cat = signal<AdminCatDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal(false);

  constructor() {
    const id$ = this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));

    combineLatest([id$, this.retry$])
      .pipe(
        filter(() => isPlatformBrowser(this.platformId)),
        tap(() => {
          this.loading.set(true);
          this.notFound.set(false);
          this.error.set(false);
        }),
        switchMap(([id]) =>
          this.adminCats.getById(id).pipe(
            tap((cat) => {
              this.cat.set(cat);
              this.loading.set(false);
            }),
            catchError((error: unknown) => {
              this.cat.set(null);
              if (error instanceof HttpErrorResponse && error.status === 404) {
                this.notFound.set(true);
              } else {
                this.error.set(true);
              }
              this.loading.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  protected reload(): void {
    this.retry$.next();
  }
}
