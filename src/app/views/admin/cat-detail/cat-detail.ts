import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  forkJoin,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { AdminCatsService } from '../cats/admin-cats.service';
import {
  ACTIVITY_LEVEL_LABELS,
  CAT_API_FIELD_ERRORS,
  CAT_DETAIL_TEXT,
  COMPATIBILITY_LABELS,
  GENDER_LABELS,
  STATUS_LABELS,
  URGENT_LABEL,
  VISIBILITY_LABELS,
} from '../cats/cat.constants';
import {
  AdminCatDetail,
  AdoptionGroupMate,
  CatFieldError,
  Characteristic,
  UpdateCatRequest,
} from '../cats/cat.models';
import { getAgeLabel } from '../cats/utils/age';
import { toInputDate } from '../cats/utils/date';
import { CatForm } from '../cat-form/cat-form';
import { CatGallery } from '../cat-gallery/cat-gallery';

const SAVED_MESSAGE_MS = 8000;

function toFormValue(cat: AdminCatDetail): UpdateCatRequest {
  return {
    name: cat.name,
    status: cat.status,
    isUrgent: cat.isUrgent,
    isFeatured: cat.isFeatured,
    gender: cat.gender,
    birthDate: toInputDate(cat.birthDate),
    birthDateIsEstimated: cat.birthDateIsEstimated,
    entryDate: toInputDate(cat.entryDate),
    vaccinated: cat.vaccinated,
    sterilized: cat.sterilized,
    activityLevel: cat.activityLevel,
    compatibleWithCats: cat.compatibleWithCats,
    compatibleWithDogs: cat.compatibleWithDogs,
    compatibleWithChildren: cat.compatibleWithChildren,
    story: cat.story,
    healthStatus: cat.healthStatus,
    specialNeeds: cat.specialNeeds,
    characteristicIds: cat.characteristics.map(({ id }) => id),
    pairedCatId: cat.adoptionGroupMates[0]?.id ?? null,
  };
}

@Component({
  selector: 'app-cat-detail',
  imports: [RouterLink, CatForm, CatGallery],
  templateUrl: './cat-detail.html',
  styleUrl: './cat-detail.scss',
})
export class CatDetail {
  private readonly adminCats = inject(AdminCatsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
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
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  private savedTimer?: ReturnType<typeof setTimeout>;
  protected readonly saveError = signal<string | null>(null);
  protected readonly fieldError = signal<CatFieldError | null>(null);
  protected readonly editData = signal<{
    characteristics: Characteristic[];
    pairedCatOptions: AdoptionGroupMate[];
  } | null>(null);
  protected readonly formValue = computed(() => {
    const cat = this.cat();
    return cat ? toFormValue(cat) : null;
  });
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.savedTimer));

    const id$ = this.route.paramMap.pipe(map((params) => params.get('id') ?? ''));
    const edit$ = this.route.queryParamMap.pipe(map((params) => params.get('edit') === 'true'));

    combineLatest([id$, this.retry$])
      .pipe(
        filter(() => isPlatformBrowser(this.platformId)),
        tap(() => {
          this.loading.set(true);
          this.notFound.set(false);
          this.error.set(false);
          this.hideSaved();
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

    combineLatest([id$, edit$, this.retry$])
      .pipe(
        filter(([, editing]) => editing && isPlatformBrowser(this.platformId)),
        tap(() => this.editData.set(null)),
        switchMap(([id]) =>
          forkJoin({
            characteristics: this.adminCats.getCharacteristics(),
            pairedCatOptions: this.adminCats.getPairedCatOptions(id),
          }).pipe(
            tap((data) => this.editData.set(data)),
            catchError(() => {
              this.error.set(true);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();

    edit$.pipe(takeUntilDestroyed()).subscribe((editing) => {
      const wasEditing = this.editing();
      this.editing.set(editing);
      if (editing) {
        this.hideSaved();
        this.saveError.set(null);
        this.fieldError.set(null);
      } else if (wasEditing) {
        this.focusHeading();
      }
    });
  }

  protected save(body: UpdateCatRequest): void {
    const cat = this.cat();
    if (!cat || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set(null);
    this.fieldError.set(null);

    this.adminCats
      .update(cat.id, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.cat.set(updated);
          this.saving.set(false);
          this.showSaved();
          this.leaveEdit();
        },
        error: (error: unknown) => {
          this.saving.set(false);
          const http = error instanceof HttpErrorResponse ? error : null;
          const code = (http?.error as { code?: string } | null)?.code;
          const fieldError = code ? CAT_API_FIELD_ERRORS[code] : undefined;
          if (fieldError) {
            this.fieldError.set({ ...fieldError });
          } else if (http?.status === 404 && !code) {
            this.cat.set(null);
            this.notFound.set(true);
          } else if (http?.status === 400) {
            this.saveError.set(this.text.badRequest);
          } else {
            this.saveError.set(this.text.saveError);
          }
        },
      });
  }

  protected closeSaved(): void {
    this.hideSaved();
    this.focusHeading();
  }

  protected leaveEdit(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: null },
      queryParamsHandling: 'merge',
    });
  }

  private showSaved(): void {
    this.hideSaved();
    this.saved.set(true);
    if (isPlatformBrowser(this.platformId)) {
      this.savedTimer = setTimeout(() => this.hideSaved(), SAVED_MESSAGE_MS);
    }
  }

  private hideSaved(): void {
    clearTimeout(this.savedTimer);
    this.saved.set(false);
  }

  private focusHeading(): void {
    afterNextRender(
      () => {
        const heading = this.heading()?.nativeElement;
        if (!heading) {
          return;
        }
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      },
      { injector: this.injector },
    );
  }

  protected reload(): void {
    this.retry$.next();
  }
}
