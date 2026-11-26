import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

const MAX_PAGES_WITHOUT_GAPS = 7;
const MAX_PAGES_WITHOUT_GAPS_MOBILE = 4;

type Visibility = 'desktop' | 'mobile' | null;

interface PageItem {
  page: number;
  label: string;
  icon?: string;
  current?: boolean;
  disabled?: boolean;
}

interface Slot {
  item: PageItem | null;
  only: Visibility;
}

function visiblePages(page: number, last: number, neighbors: number, maxAll: number): number[] {
  const pages = Array.from({ length: last }, (_, index) => index + 1);
  return last <= maxAll
    ? pages
    : pages.filter((n) => n === 1 || n === last || Math.abs(n - page) <= neighbors);
}

@Component({
  imports: [NgTemplateOutlet, RouterLink],
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly links = input(true);
  readonly variant = input<'public' | 'admin'>('admin');

  readonly pageChange = output<number>();

  protected readonly slots = computed<Slot[]>(() => {
    const page = this.page();
    const last = this.totalPages();
    const desktop = visiblePages(page, last, 1, MAX_PAGES_WITHOUT_GAPS);
    const mobile = visiblePages(page, last, 0, MAX_PAGES_WITHOUT_GAPS_MOBILE);
    const toItem = (n: number): PageItem => ({
      page: n,
      label: n === last ? `Pàgina ${n}, última` : `Pàgina ${n}`,
      current: n === page,
    });

    const slots: Slot[] = [];
    desktop.forEach((n, index) => {
      const inMobile = mobile.includes(n);
      const desktopGap = index > 0 && n - desktop[index - 1] > 1;
      const mobileGap = inMobile && n > 1 && !mobile.includes(n - 1);
      if (desktopGap || mobileGap) {
        slots.push({
          item: null,
          only: desktopGap && mobileGap ? null : desktopGap ? 'desktop' : 'mobile',
        });
      }
      slots.push({ item: toItem(n), only: inMobile ? null : 'desktop' });
    });

    return [
      {
        item: {
          page: page - 1,
          label: 'Pàgina anterior',
          icon: 'fa-chevron-left',
          disabled: page <= 1,
        },
        only: null,
      },
      ...slots,
      {
        item: {
          page: page + 1,
          label: 'Pàgina següent',
          icon: 'fa-chevron-right',
          disabled: page >= last,
        },
        only: null,
      },
    ];
  });

  protected select(item: PageItem): void {
    if (!item.current) {
      this.pageChange.emit(item.page);
    }
  }
}
