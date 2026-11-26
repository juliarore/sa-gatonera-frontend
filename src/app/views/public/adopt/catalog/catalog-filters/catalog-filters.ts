import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter, Subject } from 'rxjs';
import { Accordion } from '../../../../../shared/components/accordion/accordion';
import { FilterDropdown } from '../../../../../shared/components/filter-dropdown/filter-dropdown';
import {
  FilterOption,
  FilterOptions,
} from '../../../../../shared/components/filter-options/filter-options';
import {
  AGE_GROUP_OPTIONS,
  COMPATIBLE_WITH_LABELS,
  GENDER_LABELS,
  JOINT_ADOPTION_LABEL,
} from '../../../../../shared/cats/cat.constants';
import { CatsSort } from '../../../../../shared/cats/cat.models';
import {
  PublicCatsFilters,
  PublicCharacteristic,
} from '../../../../../shared/cats/public-cats.service';
import { countSelected, DEFAULT_SORT, EMPTY_FILTERS } from './filter-params';

const SEARCH_DELAY_MS = 300;
const URGENT_FILTER_LABEL = 'Adopció urgent';
const ALL_GENDERS_LABEL = 'Tots';

export interface FiltersDraft {
  filters: PublicCatsFilters;
  sort: CatsSort;
}

function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}

@Component({
  imports: [Accordion, FilterDropdown, FilterOptions],
  selector: 'app-catalog-filters',
  templateUrl: './catalog-filters.html',
  styleUrl: './catalog-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogFilters {
  private readonly document = inject(DOCUMENT);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly openButton = viewChild.required<ElementRef<HTMLButtonElement>>('openButton');
  private readonly applyButton = viewChild<ElementRef<HTMLButtonElement>>('applyButton');

  readonly filters = input.required<PublicCatsFilters>();
  readonly characteristics = input.required<readonly PublicCharacteristic[]>();
  readonly sort = input.required<CatsSort>();
  readonly sortOptions = input.required<readonly FilterOption<CatsSort>[]>();

  readonly filtersUpdate = output<Partial<PublicCatsFilters>>();
  readonly filtersApply = output<FiltersDraft>();

  private readonly searchInput$ = new Subject<string>();

  protected readonly allGendersLabel = ALL_GENDERS_LABEL;
  protected readonly genderOptions = toOptions(GENDER_LABELS);
  protected readonly ageGroupOptions = AGE_GROUP_OPTIONS;
  protected readonly compatibleOptions = toOptions(COMPATIBLE_WITH_LABELS);
  protected readonly adoptionOptions = toOptions({
    urgent: URGENT_FILTER_LABEL,
    joint: JOINT_ADOPTION_LABEL,
  });
  protected readonly traitOptions = computed(() =>
    this.characteristics().map(({ code, label }) => ({ value: code, label })),
  );

  protected readonly draft = signal<FiltersDraft | null>(null);
  protected readonly canClearDraft = computed(() => {
    const draft = this.draft();
    return !!draft && (countSelected(draft.filters) > 0 || draft.sort !== DEFAULT_SORT);
  });
  protected readonly draftSortLabel = computed(
    () => this.sortOptions().find(({ value }) => value === this.draft()?.sort)?.label,
  );

  protected readonly searchDraft = linkedSignal({
    source: this.filters,
    computation: (filters) => filters.search,
  });

  protected readonly activeCount = computed(() => countSelected(this.filters()));

  constructor() {
    this.searchInput$
      .pipe(
        debounceTime(SEARCH_DELAY_MS),
        filter((search) => search === this.searchDraft()),
        takeUntilDestroyed(),
      )
      .subscribe((search) => this.update({ search: search.trim() }));
  }

  protected onSearchInput(event: Event): void {
    const search = (event.target as HTMLInputElement).value;
    this.searchDraft.set(search);
    this.searchInput$.next(search);
  }

  protected toggleAdoption(value: 'urgent' | 'joint', event: Event): void {
    this.update({ [value]: (event.target as HTMLInputElement).checked });
  }

  protected update(changes: Partial<PublicCatsFilters>): void {
    this.filtersUpdate.emit(changes);
  }

  protected adoptionSelected(filters: PublicCatsFilters): ('urgent' | 'joint')[] {
    return this.adoptionOptions.filter(({ value }) => filters[value]).map(({ value }) => value);
  }

  protected updateDraft(changes: Partial<PublicCatsFilters>): void {
    this.draft.update((draft) => draft && { ...draft, filters: { ...draft.filters, ...changes } });
  }

  protected updateDraftSort(sort: CatsSort): void {
    this.draft.update((draft) => draft && { ...draft, sort });
  }

  protected clearDraft(): void {
    this.draft.set({ filters: EMPTY_FILTERS, sort: DEFAULT_SORT });
    this.applyButton()?.nativeElement.focus();
  }

  protected openDialog(): void {
    this.draft.set({ filters: { ...this.filters(), search: '' }, sort: this.sort() });
    this.dialog().nativeElement.showModal();
    this.document.body.style.overflow = 'hidden';
  }

  protected closeDialog(): void {
    this.dialog().nativeElement.close();
  }

  protected apply({ filters, sort }: FiltersDraft): void {
    this.filtersApply.emit({ filters: { ...filters, search: this.searchDraft().trim() }, sort });
    this.closeDialog();
  }

  protected onDialogClose(): void {
    this.draft.set(null);
    this.document.body.style.overflow = '';
    this.openButton().nativeElement.focus();
  }
}
