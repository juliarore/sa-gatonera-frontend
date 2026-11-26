import { DOCUMENT, ViewportScroller } from '@angular/common';
import { afterNextRender, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { filter } from 'rxjs';

export const MAIN_CONTENT_ID = 'main-content';

@Injectable({ providedIn: 'root' })
export class PageFocusService {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly viewportScroller = inject(ViewportScroller);
  private previousPath: string | null = null;

  constructor() {
    inject(Router)
      .events.pipe(
        filter(
          (event): event is Scroll =>
            event instanceof Scroll && event.routerEvent instanceof NavigationEnd,
        ),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.onScroll(event));
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    this.document.getElementById(MAIN_CONTENT_ID)?.focus();
  }

  private onScroll({ routerEvent, position, anchor }: Scroll): void {
    const path = (routerEvent as NavigationEnd).urlAfterRedirects.split(/[?#]/)[0];
    const pageChanged = this.previousPath !== null && path !== this.previousPath;
    this.previousPath = path;

    afterNextRender(
      () => {
        if (position) {
          this.viewportScroller.scrollToPosition(position);
        } else if (pageChanged && !anchor) {
          this.viewportScroller.scrollToPosition([0, 0]);
        }
        if (pageChanged) {
          this.focusPageHeading();
        }
      },
      { injector: this.injector },
    );
  }

  private focusPageHeading(): void {
    const main = this.document.getElementById(MAIN_CONTENT_ID);
    const target = main?.querySelector<HTMLElement>('h1') ?? main;
    if (!target) {
      return;
    }
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}
