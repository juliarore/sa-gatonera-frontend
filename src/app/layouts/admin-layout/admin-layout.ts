import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith, tap } from 'rxjs';
import { Breadcrumb, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb';

const DASHBOARD_LABEL = "Panell d'administració";

@Component({
  imports: [Breadcrumb, RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  private readonly sidebar = viewChild.required<ElementRef<HTMLElement>>('sidebar');
  private readonly menuToggle = viewChild.required<ElementRef<HTMLButtonElement>>('menuToggle');

  protected readonly menuOpen = signal(false);

  protected readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      tap(() => this.menuOpen.set(false)),
      startWith(null),
      map(() => {
        let current = this.route;
        while (current.firstChild) {
          current = current.firstChild;
        }
        return (current.snapshot?.data['title'] as string | undefined) ?? '';
      }),
    ),
    { initialValue: '' },
  );

  // Al dashboard la miga només mostra «Panell d'administració», sense enllaç, perquè ja som a la pàgina.
  protected readonly onDashboard = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url.split(/[?#]/)[0] === '/admin'),
    ),
    { initialValue: false },
  );

  protected readonly breadcrumb = computed<BreadcrumbItem[]>(() =>
    this.onDashboard()
      ? [{ label: DASHBOARD_LABEL }]
      : [{ label: DASHBOARD_LABEL, link: '/admin' }, { label: this.pageTitle() }],
  );

  protected toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenuAndFocusToggle();
      return;
    }
    this.menuOpen.set(true);
    afterNextRender(
      () => this.sidebar().nativeElement.querySelector<HTMLElement>('a[href]')?.focus(),
      { injector: this.injector },
    );
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected closeMenuAndFocusToggle(): void {
    if (!this.menuOpen()) {
      return;
    }
    this.closeMenu();
    this.menuToggle().nativeElement.focus();
  }
}
