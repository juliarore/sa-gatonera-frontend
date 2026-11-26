import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { CatCard } from '../../../../shared/components/cat-card/cat-card';
import { CatalogFilters, FiltersDraft } from './catalog-filters/catalog-filters';
import {
  countSelected,
  DEFAULT_SORT,
  EMPTY_FILTERS,
  readFilterParams,
  toFilterParams,
} from './catalog-filters/filter-params';
import { Dropdown } from '../../../../shared/components/dropdown/dropdown';
import { FilterOption } from '../../../../shared/components/filter-options/filter-options';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ResponsiveImage } from '../../../../shared/components/responsive-image/responsive-image';
import { toCatCardImage } from '../../../../shared/cats/cat-card-image';
import { CatsSort } from '../../../../shared/cats/cat.models';
import {
  PublicCatsFilters,
  PublicCatsPage,
  PublicCatsService,
  PublicCharacteristic,
} from '../../../../shared/cats/public-cats.service';
import { CATALOG_PATH } from '../../../../shared/navigation/routes';

interface CatalogQuery {
  page: number;
  sort: CatsSort;
  filters: PublicCatsFilters;
}

type LoadState = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 12;
const EAGER_IMAGES = 3;

const SORT_OPTIONS: readonly FilterOption<CatsSort>[] = [
  { value: 'oldest', label: 'Més antics' },
  { value: 'recent', label: 'Més recents' },
  { value: 'urgent', label: 'Més urgents' },
  { value: 'age-asc', label: 'Edat: de menor a major' },
  { value: 'age-desc', label: 'Edat: de major a menor' },
  { value: 'name', label: 'Nom: A-Z' },
  { value: 'name-desc', label: 'Nom: Z-A' },
];

function withKnownTraits(
  filters: PublicCatsFilters,
  characteristics: readonly PublicCharacteristic[],
): PublicCatsFilters {
  const known = new Set(characteristics.map(({ code }) => code));
  return { ...filters, traits: filters.traits.filter((code) => known.has(code)) };
}

function toSort(value: string | null): CatsSort {
  return SORT_OPTIONS.find((option) => option.value === value)?.value ?? DEFAULT_SORT;
}

@Component({
  imports: [CatCard, CatalogFilters, Dropdown, Pagination, ResponsiveImage],
  selector: 'app-catalog',
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicCats = inject(PublicCatsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private readonly resultsTitle = viewChild.required<ElementRef<HTMLElement>>('resultsTitle');
  private readonly reload = new BehaviorSubject<void>(undefined);
  private focusResultsOnLoad = false;

  protected readonly catalogPath = CATALOG_PATH;
  protected readonly eagerImages = EAGER_IMAGES;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly defaultSort = DEFAULT_SORT;
  protected readonly placeholders = Array.from({ length: PAGE_SIZE / 2 }, (_, index) => index);
  protected readonly state = signal<LoadState>('loading');
  protected readonly catsPage = signal<PublicCatsPage | null>(null);
  protected readonly characteristics = signal<PublicCharacteristic[]>([]);

  private readonly query$ = this.route.queryParamMap.pipe(
    map((params): CatalogQuery => {
      const page = Number(params.get('page'));
      return {
        page: Number.isInteger(page) && page >= 1 ? page : 1,
        sort: toSort(params.get('sort')),
        filters: readFilterParams(params),
      };
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
  );

  protected readonly query = toSignal(this.query$, { requireSync: true });

  protected readonly cards = computed(() =>
    (this.catsPage()?.items ?? []).map((cat) => ({ ...cat, image: toCatCardImage(cat) })),
  );
  protected readonly total = computed(() => this.catsPage()?.total ?? null);
  protected readonly totalPages = computed(() => this.catsPage()?.totalPages ?? 1);
  protected readonly filters = computed(() =>
    withKnownTraits(this.query().filters, this.characteristics()),
  );
  protected readonly hasFilters = computed(() => countSelected(this.filters()) > 0);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const sort = params.get('sort');
      if (sort !== null && toSort(sort) === DEFAULT_SORT) {
        void this.router.navigate([], {
          queryParams: { sort: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });

    afterNextRender(() => {
      const characteristics$ = this.publicCats.getCharacteristics().pipe(
        catchError(() => of([])),
        tap((characteristics) => this.characteristics.set(characteristics)),
      );

      combineLatest([this.query$, characteristics$, this.reload])
        .pipe(
          tap(() => this.state.set('loading')),
          switchMap(([{ page, sort, filters }, characteristics]) =>
            this.publicCats
              .getCats({
                ...withKnownTraits(filters, characteristics),
                page,
                pageSize: PAGE_SIZE,
                sort,
              })
              .pipe(catchError(() => of(null))),
          ),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((result) => this.showResponse(result));
    });
  }

  protected updateFilters(changes: Partial<PublicCatsFilters>): void {
    this.navigateToFirstPage(toFilterParams({ ...this.filters(), ...changes }));
  }

  protected applyFilters({ filters, sort }: FiltersDraft): void {
    this.navigateToFirstPage({
      ...toFilterParams(filters),
      sort: sort === DEFAULT_SORT ? null : sort,
    });
  }

  protected clearFilters(): void {
    this.updateFilters(EMPTY_FILTERS);
    this.resultsTitle().nativeElement.focus({ preventScroll: true });
  }

  protected focusResultsAfterLoad(): void {
    this.focusResultsOnLoad = true;
  }

  protected retry(): void {
    this.reload.next();
  }

  private navigateToFirstPage(queryParams: Params): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...queryParams, page: null },
      queryParamsHandling: 'merge',
    });
  }

  private showResponse(result: PublicCatsPage | null): void {
    if (!result) {
      this.state.set('error');
      return;
    }

    if (
      result.items.length === 0 &&
      result.totalPages > 0 &&
      this.query().page > result.totalPages
    ) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: result.totalPages === 1 ? null : result.totalPages },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      return;
    }

    this.catsPage.set(result);
    this.state.set('ready');

    if (this.focusResultsOnLoad) {
      this.focusResultsOnLoad = false;
      afterNextRender(() => this.resultsTitle().nativeElement.focus(), { injector: this.injector });
    }
  }
}
