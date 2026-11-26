import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  COMPATIBILITY_TAG_LABELS,
  GENDER_LABELS,
  JOINT_ADOPTION_LABEL,
  URGENT_LABEL,
} from '../../cats/cat.constants';
import { CatCharacteristic, CatGender, Compatibility } from '../../cats/cat.models';

export interface CatCardImage {
  src: string;
  alt: string;
}

const IMAGE_WIDTH = 822;
const IMAGE_HEIGHT = 500;

@Component({
  imports: [NgTemplateOutlet, RouterLink],
  selector: 'app-cat-card',
  templateUrl: './cat-card.html',
  styleUrl: './cat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatCard {
  readonly name = input.required<string>();
  readonly gender = input.required<CatGender>();
  readonly age = input.required<string>();
  readonly link = input.required<string | readonly unknown[]>();
  readonly characteristics = input<readonly CatCharacteristic[]>([]);
  readonly compatibleWithCats = input<Compatibility | null>(null);
  readonly compatibleWithDogs = input<Compatibility | null>(null);
  readonly compatibleWithChildren = input<Compatibility | null>(null);
  readonly image = input<CatCardImage | null>(null);
  readonly isUrgent = input(false, { transform: booleanAttribute });
  readonly isJointAdoption = input(false, { transform: booleanAttribute });
  readonly eager = input(false, { transform: booleanAttribute });

  protected readonly genderLabels = GENDER_LABELS;
  protected readonly urgentLabel = URGENT_LABEL;
  protected readonly jointAdoptionLabel = JOINT_ADOPTION_LABEL;
  protected readonly imageWidth = IMAGE_WIDTH;
  protected readonly imageHeight = IMAGE_HEIGHT;

  protected readonly tags = computed(() => {
    const compatibility = [
      this.compatibleWithCats() === 'yes' && COMPATIBILITY_TAG_LABELS.compatibleWithCats,
      this.compatibleWithDogs() === 'yes' && COMPATIBILITY_TAG_LABELS.compatibleWithDogs,
      this.compatibleWithChildren() === 'yes' && COMPATIBILITY_TAG_LABELS.compatibleWithChildren,
    ].filter((label) => label !== false);

    return [...compatibility, ...this.characteristics().map(({ label }) => label)];
  });
}
