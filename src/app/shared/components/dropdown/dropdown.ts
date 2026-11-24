import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

export interface DropdownOption {
  label: string;
  value: string;
}

let nextId = 0;

@Component({
  imports: [RouterLink],
  selector: 'app-dropdown',
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'closeOnOutsideClick($event)' },
})
export class Dropdown {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  readonly label = input.required<string>();
  readonly options = input.required<readonly DropdownOption[]>();
  readonly value = input.required<string>();
  readonly queryParam = input.required<string>();
  readonly resetQueryParams = input<readonly string[]>([]);

  protected readonly panelId = `dropdown-panel-${nextId++}`;
  protected readonly isOpen = signal(false);
  protected readonly activeLabel = computed(
    () => this.options().find(({ value }) => value === this.value())?.label ?? '',
  );

  protected toggle(): void {
    this.isOpen.update((open) => !open);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected closeAndFocusTrigger(): void {
    if (this.isOpen()) {
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

  protected queryParams(option: DropdownOption): Record<string, string | null> {
    const reset = Object.fromEntries(this.resetQueryParams().map((param) => [param, null]));
    const isDefault = option.value === this.options()[0].value;
    return { ...reset, [this.queryParam()]: isDefault ? null : option.value };
  }
}
