import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-responsive-image',
  templateUrl: './responsive-image.html',
  styleUrl: './responsive-image.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsiveImage {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly widths = input<readonly number[]>([480, 960, 1440, 1920]);
  readonly sizes = input('100vw');
  readonly priority = input(false, { transform: booleanAttribute });

  protected readonly avifSrcset = computed(() => this.srcset('avif'));
  protected readonly webpSrcset = computed(() => this.srcset('webp'));
  protected readonly jpgSrcset = computed(() => this.srcset('jpg'));
  protected readonly fallbackSrc = computed(
    () => `${this.src()}-${Math.max(...this.widths())}.jpg`,
  );

  private srcset(extension: string): string {
    return this.widths()
      .map((width) => `${this.src()}-${width}.${extension} ${width}w`)
      .join(', ');
  }
}
