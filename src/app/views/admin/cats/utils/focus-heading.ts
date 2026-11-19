import { afterNextRender, ElementRef, Injector, Signal } from '@angular/core';

export function focusHeading(
  injector: Injector,
  heading: Signal<ElementRef<HTMLElement> | undefined>,
): void {
  afterNextRender(
    () => {
      const element = heading()?.nativeElement;
      if (!element) {
        return;
      }
      element.setAttribute('tabindex', '-1');
      element.focus();
    },
    { injector },
  );
}
