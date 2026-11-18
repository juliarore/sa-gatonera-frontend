import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, EMPTY, filter, forkJoin, switchMap, tap } from 'rxjs';
import { CatForm } from '../cat-form/cat-form';
import { AdminCatsService } from '../cats/admin-cats.service';
import { CAT_CREATE_TEXT } from '../cats/cat.constants';
import {
  AdoptionGroupMate,
  CatFieldError,
  Characteristic,
  CreateCatRequest,
} from '../cats/cat.models';
import { todayInputDate } from '../cats/utils/date';
import { parseSaveError } from '../cats/utils/save-error';

function emptyCat(): CreateCatRequest {
  return {
    name: '',
    status: 'available',
    isUrgent: false,
    isFeatured: false,
    gender: 'female',
    birthDate: '',
    birthDateIsEstimated: false,
    entryDate: todayInputDate(),
    vaccinated: false,
    sterilized: false,
    activityLevel: 'medium',
    compatibleWithCats: 'unknown',
    compatibleWithDogs: 'unknown',
    compatibleWithChildren: 'unknown',
    story: '',
    healthStatus: '',
    specialNeeds: null,
    characteristicIds: [],
    pairedCatId: null,
  };
}

@Component({
  selector: 'app-cat-create',
  imports: [CatForm],
  templateUrl: './cat-create.html',
  styleUrl: './cat-create.scss',
})
export class CatCreate {
  private readonly adminCats = inject(AdminCatsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly retry$ = new BehaviorSubject<void>(undefined);

  protected readonly text = CAT_CREATE_TEXT;
  protected readonly formData = signal<{
    initialValue: CreateCatRequest;
    characteristics: Characteristic[];
    pairedCatOptions: AdoptionGroupMate[];
  } | null>(null);
  protected readonly loadError = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly fieldError = signal<CatFieldError | null>(null);

  constructor() {
    this.retry$
      .pipe(
        filter(() => isPlatformBrowser(this.platformId)),
        tap(() => {
          this.formData.set(null);
          this.loadError.set(false);
        }),
        switchMap(() =>
          forkJoin({
            characteristics: this.adminCats.getCharacteristics(),
            pairedCatOptions: this.adminCats.getPairedCatOptions(),
          }).pipe(
            tap((data) => this.formData.set({ ...data, initialValue: emptyCat() })),
            catchError(() => {
              this.loadError.set(true);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  protected save(body: CreateCatRequest): void {
    if (this.saving()) {
      return;
    }
    this.saving.set(true);
    this.saveError.set(null);
    this.fieldError.set(null);

    this.adminCats
      .create(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cat) => this.router.navigate(['/admin/cats', cat.id], { state: { created: true } }),
        error: (error: unknown) => {
          this.saving.set(false);
          const { fieldError, status } = parseSaveError(error);
          if (fieldError) {
            this.fieldError.set(fieldError);
          } else if (status === 400) {
            this.saveError.set(this.text.badRequest);
          } else {
            this.saveError.set(this.text.saveError);
          }
        },
      });
  }

  protected cancel(): void {
    this.router.navigate(['/admin/cats']);
  }

  protected reload(): void {
    this.retry$.next();
  }
}
