import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatCard } from '../../../../shared/components/cat-card/cat-card';
import { toCatCardImage } from '../../../../shared/cats/cat-card-image';
import { PublicCat, PublicCatsService } from '../../../../shared/cats/public-cats.service';
import { CATALOG_PATH } from '../../../../shared/navigation/routes';

type LoadState = 'loading' | 'ready' | 'hidden';

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
  private readonly cats = signal<PublicCat[]>([]);

  protected readonly cards = computed(() =>
    this.cats().map((cat) => ({
      ...cat,
      image: toCatCardImage(cat),
      link: [CATALOG_PATH, cat.slug],
    })),
  );

  constructor() {
    afterNextRender(() => {
      const subscription = this.publicCats.getFeaturedCats().subscribe({
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
