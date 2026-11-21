import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { MENU_ITEMS, MenuGroupItem } from './public-menu';

const MOBILE_VIEWPORT_QUERY = '(max-width: 959px)';
const HOVER_POINTER_QUERY = '(hover: hover)';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-public-header',
  templateUrl: './public-header.html',
  styleUrl: './public-header.scss',
  host: { '(document:click)': 'closeAllMenusOnOutsideClick($event)' },
})
export class PublicHeader {
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('closeButton');
  private readonly mobileToggle = viewChild.required<ElementRef<HTMLButtonElement>>('mobileToggle');

  private hoverOpenedGroupKey: string | null = null;

  protected readonly menuItems = MENU_ITEMS;
  protected readonly isMobileViewport = signal(false);
  readonly isMobileMenuOpen = model(false);
  protected readonly openGroupKey = signal<string | null>(null);

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
      map((url) => url.split(/[?#]/)[0]),
    ),
    { initialValue: '' },
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeAllMenus());

    afterNextRender(() => this.watchMobileViewport());

    effect(() => this.setPageScrollLocked(this.isMobileMenuOpen()));
    this.destroyRef.onDestroy(() => this.setPageScrollLocked(false));
  }

  protected getButtonId(groupKey: string): string {
    return `dropdown-button-${groupKey}`;
  }

  protected getDropdownId(groupKey: string): string {
    return `dropdown-${groupKey}`;
  }

  protected isRouteInGroup(group: MenuGroupItem): boolean {
    return group.links.some((link) => link.path === this.currentPath());
  }

  protected toggleMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenuAndFocusToggle();
      return;
    }
    this.isMobileMenuOpen.set(true);
    afterNextRender(() => this.closeButton().nativeElement.focus(), { injector: this.injector });
  }

  protected toggleDropdown(groupKey: string): void {
    if (this.openGroupKey() === groupKey && this.hoverOpenedGroupKey === groupKey) {
      this.hoverOpenedGroupKey = null;
      return;
    }
    this.hoverOpenedGroupKey = null;
    this.openGroupKey.update((current) => (current === groupKey ? null : groupKey));
  }

  protected openDropdownOnHover(groupKey: string): void {
    if (!this.canOpenOnHover()) {
      return;
    }
    this.openGroupKey.set(groupKey);
    this.hoverOpenedGroupKey = groupKey;
  }

  protected closeDropdownOnHoverEnd(groupKey: string): void {
    if (this.hoverOpenedGroupKey !== groupKey) {
      return;
    }
    this.closeDropdown();
  }

  protected closeDropdownOnFocusLeave(event: FocusEvent, groupKey: string): void {
    if (this.isMobileViewport()) {
      return;
    }
    const group = event.currentTarget as HTMLElement;
    const nextFocused = event.relatedTarget as Node | null;
    if (nextFocused && !group.contains(nextFocused) && this.openGroupKey() === groupKey) {
      this.closeDropdown();
    }
  }

  protected closeAllMenusOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeAllMenus();
    }
  }

  protected closeOpenMenuOnEscape(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenuAndFocusToggle();
      return;
    }
    const groupKey = this.openGroupKey();
    if (groupKey) {
      this.closeDropdown();
      this.focusElement(`#${this.getButtonId(groupKey)}`);
    }
  }

  protected closeMobileMenuAndFocusToggle(): void {
    if (!this.isMobileMenuOpen()) {
      return;
    }
    this.closeAllMenus();
    afterNextRender(() => this.mobileToggle().nativeElement.focus(), { injector: this.injector });
  }

  protected trapFocusInPanel(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.isMobileMenuOpen()) {
      return;
    }
    const focusable = this.getPanelFocusableElements();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private closeDropdown(): void {
    this.openGroupKey.set(null);
    this.hoverOpenedGroupKey = null;
  }

  private closeAllMenus(): void {
    this.closeDropdown();
    this.isMobileMenuOpen.set(false);
  }

  private canOpenOnHover(): boolean {
    return !this.isMobileViewport() && window.matchMedia(HOVER_POINTER_QUERY).matches;
  }

  private getPanelFocusableElements(): HTMLElement[] {
    const elements = this.panel().nativeElement.querySelectorAll<HTMLElement>('a[href], button');
    return Array.from(elements).filter((element) => !element.closest('[hidden]'));
  }

  private setPageScrollLocked(isLocked: boolean): void {
    this.document.body.style.overflow = isLocked ? 'hidden' : '';
  }

  private focusElement(selector: string): void {
    this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus();
  }

  private watchMobileViewport(): void {
    const query = window.matchMedia(MOBILE_VIEWPORT_QUERY);
    const syncViewport = () => {
      this.isMobileViewport.set(query.matches);
      this.closeAllMenus();
    };
    this.isMobileViewport.set(query.matches);
    query.addEventListener('change', syncViewport);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', syncViewport));
  }
}
