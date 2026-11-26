import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Disclosure } from '../../directives/disclosure';
import { FilterOption, FilterOptions } from '../filter-options/filter-options';

@Component({
  imports: [Disclosure, FilterOptions],
  selector: 'app-filter-dropdown',
  templateUrl: './filter-dropdown.html',
  styleUrl: './filter-dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDropdown<T extends string> {
  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly options = input.required<readonly FilterOption<T>[]>();
  readonly selected = input.required<readonly T[]>();
  readonly multiple = input(true);
  readonly allLabel = input<string>();

  readonly selectedChange = output<T[]>();
}
