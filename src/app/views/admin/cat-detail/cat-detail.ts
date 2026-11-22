import { isPlatformBrowser } from '@angular/common';
import {
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
  CAT_DETAIL_TEXT,
  DELETE_CAT_TEXT,
  STATUS_LABELS,
  VISIBILITY_LABELS,
} from '../cats/cat.constants';
import {
  COMPATIBILITY_LABELS,
  GENDER_LABELS,
  URGENT_LABEL,
} from '../../../shared/cats/cat.constants';
import {
  AdminCatDetail,
  AdoptionGroupMate,
  CatFieldError,
  CatImage,
  Characteristic,
  UpdateCatRequest,
} from '../cats/cat.models';
import { getAgeLabel } from '../../../shared/cats/age';
import { toInputDate } from '../../../shared/cats/date';
import { focusHeading } from '../cats/utils/focus-heading';
import { parseSaveError } from '../cats/utils/save-error';
import { CatForm } from '../cat-form/cat-form';
import { CatGallery } from '../cat-gallery/cat-gallery';
import { DeleteCatDialog } from '../delete-cat-dialog/delete-cat-dialog';
import { StatusNotice, StatusNoticeMessage } from '../status-notice/status-notice';

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
  imports: [RouterLink, CatForm, CatGallery, DeleteCatDialog, StatusNotice],
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
  protected readonly deleteText = DELETE_CAT_TEXT;
  protected readonly genderLabels = GENDER_LABELS;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly activityLabels = ACTIVITY_LEVEL_LABELS;
  protected readonly compatibilityLabels = COMPATIBILITY_LABELS;
  protected readonly visibilityLabels = VISIBILITY_LABELS;
  protected readonly urgentLabel = URGENT_LABEL;
  protected readonly ageLabel = getAgeLabel;

  protected readonly cat = signal<AdminCatDetail | null>(null);
  protected readonly images = signal<CatImage[]>([]);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal(false);
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saved = signal<StatusNoticeMessage | null>(null);
  private createdPending = this.router.currentNavigation()?.extras.state?.['created'] === true;
  protected readonly deleting = signal(false);
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
              this.images.set(cat.images);
              this.loading.set(false);
              if (this.createdPending) {
                this.createdPending = false;
                this.showSaved(this.text.created);
                this.focusHeading();
              }
            }),
            catchError((error: unknown) => {
              this.cat.set(null);
              if (parseSaveError(error).status === 404) {
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
          this.images.set(updated.images);
          this.saving.set(false);
          this.showSaved(this.text.saved);
          this.leaveEdit();
        },
        error: (error: unknown) => {
          this.saving.set(false);
          const { fieldError, status, code } = parseSaveError(error);
          if (fieldError) {
            this.fieldError.set(fieldError);
          } else if (status === 404 && !code) {
            this.cat.set(null);
            this.notFound.set(true);
          } else if (status === 400) {
            this.saveError.set(this.text.badRequest);
          } else {
            this.saveError.set(this.text.saveError);
          }
        },
      });
  }

  protected onUploadFinished(message: string | null): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { edit: true },
        queryParamsHandling: 'merge',
        fragment: 'fotos',
      })
      .then(() => {
        if (message) {
          this.saveError.set(message);
        }
      });
  }

  protected onDeleted(): void {
    this.router.navigate(['/admin/cats'], { state: { deleted: true } });
  }

  protected onGone(): void {
    this.router.navigate(['/admin/cats'], { state: { gone: true } });
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

  private showSaved(message: string): void {
    this.saved.set({ text: message });
  }

  protected hideSaved(): void {
    this.saved.set(null);
  }

  private focusHeading(): void {
    focusHeading(this.injector, this.heading);
  }

  protected reload(): void {
    this.retry$.next();
  }
}
