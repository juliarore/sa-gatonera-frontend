import { Component, input, signal } from '@angular/core';
import { CAT_DETAIL_TEXT } from '../cats/cat.constants';
import { CatImage } from '../cats/cat.models';
import { imageUrl } from '../cats/utils/image-url';

@Component({
  selector: 'app-cat-gallery',
  templateUrl: './cat-gallery.html',
  styleUrl: './cat-gallery.scss',
})
export class CatGallery {
  readonly images = input.required<CatImage[]>();

  protected readonly text = CAT_DETAIL_TEXT.photos;
  protected readonly imageUrl = imageUrl;
  protected readonly failed = signal<ReadonlySet<string>>(new Set());

  protected markFailed(id: string): void {
    this.failed.update((ids) => new Set(ids).add(id));
  }
}
