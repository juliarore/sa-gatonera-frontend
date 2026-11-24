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
import { ActivatedRoute, Router } from '@angular/router';
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
import { Dropdown, DropdownOption } from '../../../../shared/components/dropdown/dropdown';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ResponsiveImage } from '../../../../shared/components/responsive-image/responsive-image';
import { toCatCardImage } from '../../../../shared/cats/cat-card-image';
import { CatsSort } from '../../../../shared/cats/cat.models';
import { PublicCatsPage, PublicCatsService } from '../../../../shared/cats/public-cats.service';
import { CATALOG_PATH } from '../../../../shared/navigation/routes';

interface CatalogQuery {
  page: number;
  sort: CatsSort;
}

type LoadState = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 12;
const EAGER_IMAGES = 3;

const SORT_OPTIONS: readonly (DropdownOption & { value: CatsSort })[] = [
  { value: 'oldest', label: 'Més antics' },
  { value: 'recent', label: 'Més recents' },
  { value: 'urgent', label: 'Més urgents' },
  { value: 'age-asc', label: 'Edat: de menor a major' },
  { value: 'age-desc', label: 'Edat: de major a menor' },
  { value: 'name', label: 'Nom: A-Z' },
  { value: 'name-desc', label: 'Nom: Z-A' },
];

const DEFAULT_SORT: CatsSort = 'oldest';

function toSort(value: string | null): CatsSort {
  return SORT_OPTIONS.find((option) => option.value === value)?.value ?? DEFAULT_SORT;
}

@Component({
  imports: [CatCard, Dropdown, Pagination, ResponsiveImage],
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
  protected readonly placeholders = Array.from({ length: PAGE_SIZE / 2 }, (_, index) => index);
  protected readonly state = signal<LoadState>('loading');
  private readonly catsPage = signal<PublicCatsPage | null>(null);

  private readonly query$ = this.route.queryParamMap.pipe(
    map((params): CatalogQuery => {
      const page = Number(params.get('page'));
      return {
        page: Number.isInteger(page) && page >= 1 ? page : 1,
        sort: toSort(params.get('sort')),
      };
    }),
    distinctUntilChanged((a, b) => a.page === b.page && a.sort === b.sort),
  );

  protected readonly query = toSignal(this.query$, { requireSync: true });

  protected readonly cards = computed(() =>
    (this.catsPage()?.items ?? []).map((cat) => ({ ...cat, image: toCatCardImage(cat) })),
  );
  protected readonly total = computed(() => this.catsPage()?.total ?? null);
  protected readonly totalPages = computed(() => this.catsPage()?.totalPages ?? 1);

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
      combineLatest([this.query$, this.reload])
        .pipe(
          tap(() => this.state.set('loading')),
          switchMap(([{ page, sort }]) =>
            this.publicCats.getCats({ page, pageSize: PAGE_SIZE, sort }).pipe(
              map((result) => ({ result })),
              catchError(() => of(null)),
            ),
          ),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((response) => this.showResponse(response?.result ?? null));
    });
  }

  protected focusResultsAfterLoad(): void {
    this.focusResultsOnLoad = true;
  }

  protected retry(): void {
    this.reload.next();
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
