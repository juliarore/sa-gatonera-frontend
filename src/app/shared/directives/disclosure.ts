import { contentChild, Directive, ElementRef, inject, input, signal } from '@angular/core';

@Directive({
  selector: '[appDisclosure]',
  exportAs: 'disclosure',
  host: {
    '(keydown.escape)': 'closeAndFocusTrigger($event)',
    '(focusout)': 'closeOnFocusLeave($event)',
    '(document:click)': 'closeOnOutsideClick($event)',
  },
})
export class Disclosure {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = contentChild.required<ElementRef<HTMLElement>>('trigger');

  readonly panelId = input.required<string>({ alias: 'appDisclosure' });
  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  close(): void {
    this.isOpen.set(false);
  }

  protected closeAndFocusTrigger(event: Event): void {
    if (this.isOpen()) {
      event.stopPropagation();
      this.close();
      this.trigger().nativeElement.focus();
    }
  }

  protected closeOnFocusLeave(event: FocusEvent): void {
    const nextFocused = event.relatedTarget as Node | null;
    if (nextFocused && !this.host.nativeElement.contains(nextFocused)) {
      this.close();
    }
  }

  protected closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
