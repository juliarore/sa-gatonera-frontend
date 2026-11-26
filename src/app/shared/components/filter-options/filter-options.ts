import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-filter-options',
  templateUrl: './filter-options.html',
  styleUrl: './filter-options.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterOptions<T extends string> {
  readonly name = input.required<string>();
  readonly legend = input.required<string>();
  readonly options = input.required<readonly FilterOption<T>[]>();
  readonly selected = input.required<readonly T[]>();
  readonly multiple = input(true);
  readonly allLabel = input<string>();

  readonly selectedChange = output<T[]>();

  protected select(value: T, event: Event): void {
    if (!this.multiple()) {
      this.selectedChange.emit([value]);
      return;
    }
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedChange.emit(
      checked ? [...this.selected(), value] : this.selected().filter((item) => item !== value),
    );
  }
}
