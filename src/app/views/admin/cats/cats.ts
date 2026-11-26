import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  EMPTY,
  filter,
  map,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { AdminCatsService } from './admin-cats.service';
import { StatusNotice, StatusNoticeMessage } from '../status-notice/status-notice';
import { DeleteCatDialog } from '../delete-cat-dialog/delete-cat-dialog';
import {
  DEFAULT_SORT,
  DEFAULT_SORT_DIRECTION,
  DELETE_CAT_TEXT,
  FEATURED_TEXT,
  PAGE_SIZE,
  SORT_COLUMNS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  VISIBILITY_LABELS,
} from './cat.constants';
import {
  AGE_GROUP_OPTIONS,
  AGE_GROUPS,
  GENDER_LABELS,
  URGENT_LABEL,
} from '../../../shared/cats/cat.constants';
import {
  AdminCat,
  AdminCatsPage,
  AdminCatsSort,
  AgeGroup,
  CatStatus,
  FeaturedSummary,
  SortDirection,
} from './cat.models';
import { focusHeading } from './utils/focus-heading';
import { imageUrl } from '../../../shared/cats/image-url';
import { Pagination } from '../../../shared/components/pagination/pagination';

interface CatsUrlState {
  search: string;
  status: CatStatus | '';
  ageGroup: AgeGroup | '';
  urgent: boolean;
  featured: boolean;
  sort: AdminCatsSort;
  dir: SortDirection;
  page: number;
}

const SEARCH_DELAY_MS = 300;

const STATUS_VALUES: string[] = STATUS_OPTIONS.map((option) => option.value);
const AGE_GROUP_VALUES: string[] = AGE_GROUP_OPTIONS.map((option) => option.value);
const SORT_VALUES: string[] = SORT_COLUMNS.map((column) => column.sort);

function parseUrlState(params: ParamMap): CatsUrlState {
  const search = (params.get('search') ?? '').trim();
  const status = params.get('status') ?? '';
  const ageGroup = params.get('ageGroup') ?? '';
  const sort = params.get('sort') ?? '';
  const rawPage = params.get('page') ?? '';
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  return {
    search,
    status: STATUS_VALUES.includes(status) ? (status as CatStatus) : '',
    ageGroup: AGE_GROUP_VALUES.includes(ageGroup) ? (ageGroup as AgeGroup) : '',
    urgent: params.get('urgent') === 'true',
    featured: params.get('featured') === 'true',
    sort: SORT_VALUES.includes(sort) ? (sort as AdminCatsSort) : DEFAULT_SORT,
    dir: params.get('dir') === 'asc' ? 'asc' : DEFAULT_SORT_DIRECTION,
    page: Number.isSafeInteger(page) && page >= 1 ? page : 1,
  };
}

@Component({
  selector: 'app-cats',
  imports: [RouterLink, DeleteCatDialog, Pagination, StatusNotice],
  templateUrl: './cats.html',
  styleUrl: './cats.scss',
})
export class Cats {
  private readonly adminCats = inject(AdminCatsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly retry$ = new BehaviorSubject<void>(undefined);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  private readonly searchInput$ = new Subject<string>();

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly sortColumns = SORT_COLUMNS;
  protected readonly ageGroupOptions = AGE_GROUP_OPTIONS;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly ageGroups = AGE_GROUPS;
  protected readonly genderLabels = GENDER_LABELS;
  protected readonly visibilityLabels = VISIBILITY_LABELS;
  protected readonly urgentLabel = URGENT_LABEL;
  protected readonly imageUrl = imageUrl;

  protected readonly featuredLabel = FEATURED_TEXT.label;
  protected readonly featuredCount = signal<number | null>(null);
  protected readonly featuredNotice = computed(() => {
    const count = this.featuredCount();
    if (count === null || count >= 3) {
      return null;
    }
    return count === 0 ? FEATURED_TEXT.summaryNone : FEATURED_TEXT.summaryFew(count);
  });

  protected readonly deleteText = DELETE_CAT_TEXT;
  protected readonly deleteTarget = signal<AdminCat | null>(null);
  protected readonly notice = signal<StatusNoticeMessage | null>(null);

  private readonly state$ = this.route.queryParamMap.pipe(map(parseUrlState));
  protected readonly state = toSignal(this.state$, { requireSync: true });
  protected readonly searchDraft = linkedSignal({
    source: this.state,
    computation: (state) => state.search,
  });
  protected readonly hasFilters = computed(() => {
    const { search, status, ageGroup, urgent, featured } = this.state();
    return Boolean(search || status || ageGroup || urgent || featured);
  });
  protected readonly sortSummary = computed(() => {
    const { sort, dir } = this.state();
    const column = SORT_COLUMNS.find((item) => item.sort === sort)!;
    return `Ordenats per ${column.label} (${column.directions[dir]})`;
  });

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

  constructor() {
    this.searchInput$
      .pipe(
        debounceTime(SEARCH_DELAY_MS),
        filter((search) => search === this.searchDraft()),
        takeUntilDestroyed(),
      )
      .subscribe((search) => this.updateUrl({ search: search.trim() }));

    if (isPlatformBrowser(this.platformId)) {
      this.loadFeaturedSummary();
      const navState = this.router.currentNavigation()?.extras.state;
      if (navState?.['deleted']) {
        this.showNotice(DELETE_CAT_TEXT.deleted);
      } else if (navState?.['gone']) {
        this.showNotice(DELETE_CAT_TEXT.gone);
      }
    }

    combineLatest([this.state$, this.retry$])
      .pipe(
        filter(() => isPlatformBrowser(this.platformId)),
        tap(() => {
          this.loading.set(true);
          this.error.set(false);
        }),
        switchMap(([state]) =>
          this.adminCats
            .list({
              search: state.search,
              status: state.status,
              ageGroup: state.ageGroup,
              isUrgent: state.urgent,
              isFeatured: state.featured,
              sort: state.sort,
              dir: state.dir,
              page: state.page,
              limit: PAGE_SIZE,
            })
            .pipe(
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
    const search = (event.target as HTMLInputElement).value;
    this.searchDraft.set(search);
    this.searchInput$.next(search);
  }

  protected onStatusChange(event: Event): void {
    this.updateUrl({ status: (event.target as HTMLSelectElement).value as CatStatus | '' });
  }

  protected onAgeGroupChange(event: Event): void {
    this.updateUrl({ ageGroup: (event.target as HTMLSelectElement).value as AgeGroup | '' });
  }

  protected onUrgentChange(event: Event): void {
    this.updateUrl({ urgent: (event.target as HTMLInputElement).checked });
  }

  protected onFeaturedChange(event: Event): void {
    this.updateUrl({ featured: (event.target as HTMLInputElement).checked });
  }

  protected clearFilters(): void {
    this.updateUrl({ search: '', status: '', ageGroup: '', urgent: false, featured: false });
  }

  protected sortBy(sort: AdminCatsSort): void {
    const state = this.state();
    const isActive = sort === state.sort;
    if (isActive && state.dir === 'asc') {
      this.updateUrl({ sort, dir: 'desc' });
    } else if (isActive && sort !== DEFAULT_SORT) {
      this.updateUrl({ sort: DEFAULT_SORT, dir: DEFAULT_SORT_DIRECTION });
    } else {
      this.updateUrl({ sort, dir: 'asc' });
    }
  }

  protected ariaSort(sort: AdminCatsSort): 'ascending' | 'descending' | 'none' {
    const state = this.state();
    if (state.sort !== sort) {
      return 'none';
    }
    return state.dir === 'asc' ? 'ascending' : 'descending';
  }

  protected goToPage(page: number): void {
    const catsPage = this.catsPage();
    if (!catsPage || page < 1 || page > catsPage.totalPages || page === catsPage.page) {
      return;
    }
    this.updateUrl({ page });
  }

  protected load(): void {
    this.retry$.next();
  }

  protected onDeleted(): void {
    this.afterDelete(DELETE_CAT_TEXT.deleted);
  }

  protected onGone(): void {
    this.afterDelete(DELETE_CAT_TEXT.gone);
  }

  protected closeNotice(): void {
    this.notice.set(null);
    this.focusHeading();
  }

  private afterDelete(message: string): void {
    this.deleteTarget.set(null);
    this.showNotice(message);
    this.loadFeaturedSummary();
    const current = this.catsPage();
    if (current && current.items.length === 1 && current.page > 1) {
      this.updateUrl({ page: current.page - 1 });
    } else {
      this.load();
    }
  }

  private showNotice(message: string): void {
    this.notice.set({ text: message });
    this.focusHeading();
  }

  private loadFeaturedSummary(): void {
    this.adminCats
      .getFeaturedSummary()
      .pipe(
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((summary: FeaturedSummary) => this.featuredCount.set(summary.count));
  }

  private focusHeading(): void {
    focusHeading(this.injector, this.heading);
  }

  private updateUrl(changes: Partial<CatsUrlState>): void {
    const state: CatsUrlState = { ...this.state(), page: 1, ...changes };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: state.search || null,
        status: state.status || null,
        ageGroup: state.ageGroup || null,
        urgent: state.urgent || null,
        featured: state.featured || null,
        sort: state.sort === DEFAULT_SORT ? null : state.sort,
        dir: state.dir === DEFAULT_SORT_DIRECTION ? null : state.dir,
        page: state.page > 1 ? state.page : null,
      },
    });
  }
}
