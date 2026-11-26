import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Disclosure } from '../../directives/disclosure';
import { FilterOption } from '../filter-options/filter-options';

@Component({
  imports: [RouterLink, Disclosure],
  selector: 'app-dropdown',
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dropdown {
  readonly label = input.required<string>();
  readonly options = input.required<readonly FilterOption<string>[]>();
  readonly value = input.required<string>();
  readonly defaultValue = input.required<string>();
  readonly queryParam = input.required<string>();
  readonly resetQueryParams = input<readonly string[]>([]);

  protected readonly activeLabel = computed(
    () => this.options().find(({ value }) => value === this.value())?.label ?? '',
  );

  protected queryParams(option: FilterOption<string>): Record<string, string | null> {
    const reset = Object.fromEntries(this.resetQueryParams().map((param) => [param, null]));
    const value = option.value === this.defaultValue() ? null : option.value;
    return { ...reset, [this.queryParam()]: value };
  }
}
