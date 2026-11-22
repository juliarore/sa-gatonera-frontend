import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatCard, CatCardImage } from '../../../../shared/components/cat-card/cat-card';
import { getAgeLabel } from '../../../../shared/cats/age';
import { toDisplayDate } from '../../../../shared/cats/date';
import { imageUrl } from '../../../../shared/cats/image-url';
import { FeaturedCat, PublicCatsService } from '../../../../shared/cats/public-cats.service';

type LoadState = 'loading' | 'ready' | 'hidden';

const CATALOG_PATH = '/adopta/gats-adopcio';

function toCardImage(cat: FeaturedCat): CatCardImage | null {
  return cat.coverImageUrl
    ? { src: imageUrl(cat.coverImageUrl), alt: cat.coverImageAlt || `Foto de ${cat.name}` }
    : null;
}

@Component({
  imports: [CatCard, RouterLink],
  selector: 'app-featured-cats',
  templateUrl: './featured-cats.html',
  styleUrl: './featured-cats.scss',
})
export class FeaturedCats {
  private readonly publicCats = inject(PublicCatsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly catalogPath = CATALOG_PATH;
  protected readonly state = signal<LoadState>('loading');
  private readonly cats = signal<FeaturedCat[]>([]);

  protected readonly cards = computed(() =>
    this.cats().map((cat) => ({
      ...cat,
      age: getAgeLabel(toDisplayDate(cat.birthDate)),
      image: toCardImage(cat),
      link: [CATALOG_PATH, cat.slug],
    })),
  );

  constructor() {
    afterNextRender(() => {
      const subscription = this.publicCats.getFeatured().subscribe({
        next: (cats) => {
          this.cats.set(cats);
          this.state.set(cats.length > 0 ? 'ready' : 'hidden');
        },
        error: () => this.state.set('hidden'),
      });
      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    });
  }
}
