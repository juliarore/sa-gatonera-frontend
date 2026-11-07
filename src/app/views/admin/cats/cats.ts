import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
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

@Component({
  selector: 'app-cats',
  templateUrl: './cats.html',
  styleUrl: './cats.scss',
})
export class Cats {
  private readonly adminCats = inject(AdminCatsService);
  private readonly destroyRef = inject(DestroyRef);
  private request?: Subscription;

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

  private readonly applied = signal<{
    search: string;
    status: CatStatus | '';
    ageGroup: AgeGroup | '';
  }>({ search: '', status: '', ageGroup: '' });
  private readonly page = signal(1);

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
    afterNextRender(() => this.load());
    this.destroyRef.onDestroy(() => this.request?.unsubscribe());
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
    this.applied.set({
      search: this.searchDraft().trim(),
      status: this.statusDraft(),
      ageGroup: this.ageGroupDraft(),
    });
    this.page.set(1);
    this.load();
  }

  protected clearFilters(): void {
    this.searchDraft.set('');
    this.statusDraft.set('');
    this.ageGroupDraft.set('');
    this.applyFilters();
  }

  protected goToPage(page: number): void {
    const catsPage = this.catsPage();
    if (!catsPage || page < 1 || page > catsPage.totalPages || page === catsPage.page) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  protected load(): void {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.error.set(false);

    this.request = this.adminCats
      .list({ ...this.applied(), page: this.page(), limit: PAGE_SIZE })
      .subscribe({
        next: (catsPage) => {
          this.catsPage.set(catsPage);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
