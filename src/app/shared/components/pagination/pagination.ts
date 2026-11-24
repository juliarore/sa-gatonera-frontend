import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

const MAX_PAGES_WITHOUT_GAPS = 5;
const EDGE_PAGES = 4;

@Component({
  imports: [RouterLink],
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageSelect = output<void>();

  protected readonly pages = computed<(number | null)[]>(() => {
    const page = this.page();
    const last = this.totalPages();
    const range = (from: number, to: number) =>
      Array.from({ length: to - from + 1 }, (_, index) => from + index);

    if (last <= MAX_PAGES_WITHOUT_GAPS) {
      return range(1, last);
    }
    if (page < EDGE_PAGES) {
      return [...range(1, EDGE_PAGES), null, last];
    }
    if (page > last - EDGE_PAGES + 1) {
      return [1, null, ...range(last - EDGE_PAGES + 1, last)];
    }
    return [1, null, page - 1, page, page + 1, null, last];
  });

  protected queryParams(page: number): Record<string, number | null> {
    return { page: page === 1 ? null : page };
  }
}
