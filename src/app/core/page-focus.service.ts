import { DOCUMENT } from '@angular/common';
import { afterNextRender, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, pairwise } from 'rxjs';

export const MAIN_CONTENT_ID = 'main-content';

@Injectable({ providedIn: 'root' })
export class PageFocusService {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects.split(/[?#]/)[0]),
        // Només movem el focus si canvia la pàgina; si només canvien els filtres, no.
        pairwise(),
        filter(([previous, current]) => previous !== current),
        takeUntilDestroyed(),
      )
      .subscribe(() => afterNextRender(() => this.focusPageHeading(), { injector: this.injector }));
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    this.document.getElementById(MAIN_CONTENT_ID)?.focus();
  }

  private focusPageHeading(): void {
    const main = this.document.getElementById(MAIN_CONTENT_ID);
    const target = main?.querySelector<HTMLElement>('h1') ?? main;
    if (!target) {
      return;
    }
    target.setAttribute('tabindex', '-1');
    target.focus();
  }
}
