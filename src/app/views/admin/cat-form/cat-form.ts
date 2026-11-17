import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CatGallery } from '../cat-gallery/cat-gallery';
import {
  ACTIVITY_LEVEL_LABELS,
  CAT_DETAIL_TEXT,
  CAT_FORM_TEXT,
  COMPATIBILITY_LABELS,
  GENDER_LABELS,
  STATUS_OPTIONS,
} from '../cats/cat.constants';
import {
  ActivityLevel,
  AdoptionGroupMate,
  CatFieldError,
  CatGender,
  CatImage,
  CatStatus,
  Characteristic,
  Compatibility,
  UpdateCatRequest,
} from '../cats/cat.models';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NAME_MAX_LENGTH = 100;
const NAME_PATTERN = /^[\p{L}][\p{L}\s.'’-]*$/u;
const API_ERROR_FIELDS = ['isFeatured', 'pairedCatId', 'characteristicIds'] as const;

function requiredText(control: AbstractControl): ValidationErrors | null {
  return (control.value as string).trim() === '' ? { required: true } : null;
}

function validName(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string).trim();
  return value === '' || NAME_PATTERN.test(value) ? null : { namePattern: true };
}

function atLeastOne(control: AbstractControl): ValidationErrors | null {
  return (control.value as string[]).length === 0 ? { atLeastOne: true } : null;
}

function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}

@Component({
  selector: 'app-cat-form',
  imports: [ReactiveFormsModule, CatGallery],
  templateUrl: './cat-form.html',
  styleUrl: './cat-form.scss',
})
export class CatForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly headingElement = viewChild.required<ElementRef<HTMLElement>>('headingEl');

  readonly initialValue = input.required<UpdateCatRequest>();
  readonly heading = input.required<string>();
  readonly adoptionFee = input<number | null>(null);
  readonly saving = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly images = input<CatImage[]>([]);
  readonly characteristics = input<Characteristic[]>([]);
  readonly pairedCatOptions = input<AdoptionGroupMate[]>([]);
  readonly apiError = input<CatFieldError | null>(null);

  readonly submitted = output<UpdateCatRequest>();
  readonly cancelled = output<void>();

  protected readonly text = CAT_DETAIL_TEXT;
  protected readonly formText = CAT_FORM_TEXT;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly genderOptions = toOptions(GENDER_LABELS);
  protected readonly activityOptions = toOptions(ACTIVITY_LEVEL_LABELS);
  protected readonly compatibilityOptions = toOptions(COMPATIBILITY_LABELS);
  protected readonly yesNoOptions = [
    { value: true, label: CAT_DETAIL_TEXT.yes },
    { value: false, label: CAT_DETAIL_TEXT.no },
  ];

  private attempted = false;
  private readonly serverError = signal<CatFieldError | null>(null);

  protected readonly form = this.fb.group({
    name: ['', [requiredText, validName, Validators.maxLength(NAME_MAX_LENGTH)]],
    status: ['available' as CatStatus],
    isUrgent: [false],
    isFeatured: [false],
    gender: ['male' as CatGender],
    birthDate: ['', [Validators.required, Validators.pattern(DATE_PATTERN)]],
    birthDateIsEstimated: [false],
    entryDate: ['', [Validators.required, Validators.pattern(DATE_PATTERN)]],
    vaccinated: [false],
    sterilized: [false],
    activityLevel: ['medium' as ActivityLevel],
    compatibleWithCats: ['unknown' as Compatibility],
    compatibleWithDogs: ['unknown' as Compatibility],
    compatibleWithChildren: ['unknown' as Compatibility],
    pairedCatId: [''],
    characteristicIds: [[] as string[], [atLeastOne]],
    story: ['', [requiredText]],
    healthStatus: ['', [requiredText]],
    specialNeeds: [''],
  });

  protected readonly gender = toSignal(this.form.controls.gender.valueChanges, {
    initialValue: this.form.controls.gender.value,
  });

  constructor() {
    effect(() => {
      const initial = this.initialValue();
      this.attempted = false;
      this.form.reset({
        ...initial,
        specialNeeds: initial.specialNeeds ?? '',
        pairedCatId: initial.pairedCatId ?? '',
      });
    });
    effect(() => {
      const apiError = this.apiError();
      this.serverError.set(apiError);
      if (apiError) {
        this.focusField(apiError.field);
      }
    });
    for (const field of API_ERROR_FIELDS) {
      const control: AbstractControl = this.form.controls[field];
      control.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
        if (this.serverError()?.field === field) {
          this.serverError.set(null);
        }
      });
    }
    afterNextRender(() => this.focusHeading());
  }

  private focusField(name: string): void {
    this.host.nativeElement.querySelector<HTMLElement>(`#cat-form-${name}`)?.focus();
  }

  private focusHeading(): void {
    const heading = this.headingElement().nativeElement;
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }

  protected showSummary(): boolean {
    return (this.attempted && this.form.invalid) || this.serverError() !== null;
  }

  protected characteristicLabel(characteristic: Characteristic): string {
    return this.gender() === 'female'
      ? characteristic.labelFeminine
      : characteristic.labelMasculine;
  }

  protected isCharacteristicChecked(id: string): boolean {
    return this.form.controls.characteristicIds.value.includes(id);
  }

  protected toggleCharacteristic(id: string, event: Event): void {
    const control = this.form.controls.characteristicIds;
    const checked = (event.target as HTMLInputElement).checked;
    control.setValue(
      checked ? [...control.value, id] : control.value.filter((value) => value !== id),
    );
    control.markAsTouched();
  }

  protected error(name: string): string | null {
    const serverError = this.serverError();
    if (serverError?.field === name) {
      return serverError.message;
    }
    const control = this.form.get(name);
    if (!control || !control.invalid || !control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return CAT_FORM_TEXT.errors.required;
    }
    if (control.hasError('atLeastOne')) {
      return CAT_FORM_TEXT.errors.characteristicsRequired;
    }
    if (control.hasError('maxlength')) {
      return CAT_FORM_TEXT.errors.nameMaxLength;
    }
    if (control.hasError('namePattern')) {
      return CAT_FORM_TEXT.errors.namePattern;
    }
    if (control.hasError('pattern')) {
      return CAT_FORM_TEXT.errors.invalidDate;
    }
    return CAT_FORM_TEXT.errors.required;
  }

  protected submit(): void {
    if (this.saving()) {
      return;
    }
    this.attempted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      const firstInvalid = Object.keys(this.form.controls).find(
        (name) => this.form.get(name)?.invalid,
      );
      if (firstInvalid) {
        this.focusField(firstInvalid);
      }
      return;
    }

    const { pairedCatId, ...value } = this.form.getRawValue();
    const body: UpdateCatRequest = {
      ...value,
      name: value.name.trim(),
      story: value.story.trim(),
      healthStatus: value.healthStatus.trim(),
      specialNeeds: value.specialNeeds.trim() || null,
    };
    if ((pairedCatId || null) !== (this.initialValue().pairedCatId ?? null)) {
      body.pairedCatId = pairedCatId || null;
    }
    this.submitted.emit(body);
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
