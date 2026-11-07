import { DOCUMENT } from '@angular/common';
import { afterNextRender, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, skip } from 'rxjs';

export const MAIN_CONTENT_ID = 'main-content';

@Injectable({ providedIn: 'root' })
export class PageFocusService {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        // La primera navegació és la càrrega inicial: no cal moure el focus.
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() =>
        afterNextRender(() => this.focusPageHeading(), { injector: this.injector }),
      );
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
    // El títol necessita tabindex="-1" per poder rebre el focus per codi.
    target.setAttribute('tabindex', '-1');
    target.focus();
  }
}
