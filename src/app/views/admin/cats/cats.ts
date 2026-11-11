import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
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
import { AdminCatsService } from './admin-cats.service';
import {
  AGE_GROUP_LABELS,
  AGE_GROUP_OPTIONS,
  GENDER_LABELS,
  PAGE_SIZE,
  STATUS_LABELS,
  STATUS_OPTIONS,
  URGENT_LABEL,
  VISIBILITY_LABELS,
} from './cat.constants';
import { AdminCatsPage, AgeGroup, CatStatus } from './cat.models';
import { getAgeLabel } from './utils/age';

type PageItem = number | 'ellipsis';

interface CatsUrlState {
  search: string;
  status: CatStatus | '';
  ageGroup: AgeGroup | '';
  page: number;
}

const STATUS_VALUES: string[] = STATUS_OPTIONS.map((option) => option.value);
const AGE_GROUP_VALUES: string[] = AGE_GROUP_OPTIONS.map((option) => option.value);

function parseUrlState(params: ParamMap): CatsUrlState {
  const search = (params.get('search') ?? '').trim();
  const status = params.get('status') ?? '';
  const ageGroup = params.get('ageGroup') ?? '';
  const rawPage = params.get('page') ?? '';
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  return {
    search,
    status: STATUS_VALUES.includes(status) ? (status as CatStatus) : '',
    ageGroup: AGE_GROUP_VALUES.includes(ageGroup) ? (ageGroup as AgeGroup) : '',
    page: Number.isSafeInteger(page) && page >= 1 ? page : 1,
  };
}

@Component({
  selector: 'app-cats',
  templateUrl: './cats.html',
  styleUrl: './cats.scss',
})
export class Cats {
  private readonly adminCats = inject(AdminCatsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly retry$ = new BehaviorSubject<void>(undefined);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly ageGroupOptions = AGE_GROUP_OPTIONS;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly ageGroupLabels = AGE_GROUP_LABELS;
  protected readonly genderLabels = GENDER_LABELS;
  protected readonly visibilityLabels = VISIBILITY_LABELS;
  protected readonly urgentLabel = URGENT_LABEL;
  protected readonly ageLabel = getAgeLabel;

  protected readonly searchDraft = signal('');
  protected readonly statusDraft = signal<CatStatus | ''>('');
  protected readonly ageGroupDraft = signal<AgeGroup | ''>('');


  protected readonly catsPage = signal<AdminCatsPage | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly firstShown = computed(() => {
    const catsPage = this.catsPage();
    return catsPage ? (catsPage.page - 1) * catsPage.limit + 1 : 0;
  });
  protected readonly lastShown = computed(() => {
    const catsPage = this.catsPage();
    return catsPage ? Math.min(catsPage.page * catsPage.limit, catsPage.total) : 0;
  });

  protected readonly pageItems = computed<PageItem[]>(() => {
    const catsPage = this.catsPage();
    if (!catsPage) {
      return [];
    }
    const { page, totalPages } = catsPage;
    const pages = new Set(
      [1, page - 1, page, page + 1, totalPages].filter(
        (n) => n >= 1 && n <= totalPages,
      ),
    );
    const sorted = [...pages].sort((a, b) => a - b);
    const items: PageItem[] = [];
    sorted.forEach((n, index) => {
      if (index > 0 && n - sorted[index - 1] > 1) {
        items.push('ellipsis');
      }
      items.push(n);
    });
    return items;
  });

  constructor() {
    const state$ = this.route.queryParamMap.pipe(
      map(parseUrlState),
      tap((state) => {
        this.searchDraft.set(state.search);
        this.statusDraft.set(state.status);
        this.ageGroupDraft.set(state.ageGroup);
      }),
    );

    combineLatest([state$, this.retry$])
      .pipe(
        filter(() => isPlatformBrowser(this.platformId)),
        tap(() => {
          this.loading.set(true);
          this.error.set(false);
        }),
        switchMap(([state]) =>
          this.adminCats.list({ ...state, limit: PAGE_SIZE }).pipe(
            tap((catsPage) => {
              this.catsPage.set(catsPage);
              this.loading.set(false);
            }),
            catchError(() => {
              this.error.set(true);
              this.loading.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  protected onSearchInput(event: Event): void {
    this.searchDraft.set((event.target as HTMLInputElement).value);
  }

  protected onStatusChange(event: Event): void {
    this.statusDraft.set((event.target as HTMLSelectElement).value as CatStatus | '');
  }

  protected onAgeGroupChange(event: Event): void {
    this.ageGroupDraft.set((event.target as HTMLSelectElement).value as AgeGroup | '');
  }

  protected applyFilters(event?: Event): void {
    event?.preventDefault();
    this.navigate({
      search: this.searchDraft().trim(),
      status: this.statusDraft(),
      ageGroup: this.ageGroupDraft(),
      page: 1,
    });
  }

  protected clearFilters(): void {
    this.router.navigate([], { relativeTo: this.route });
  }

  protected goToPage(page: number): void {
    const catsPage = this.catsPage();
    if (!catsPage || page < 1 || page > catsPage.totalPages || page === catsPage.page) {
      return;
    }
    this.navigate({ ...parseUrlState(this.route.snapshot.queryParamMap), page });
  }

  protected load(): void {
    this.retry$.next();
  }

  private navigate(state: CatsUrlState): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: state.search || null,
        status: state.status || null,
        ageGroup: state.ageGroup || null,
        page: state.page > 1 ? state.page : null,
      },
    });
  }
}
