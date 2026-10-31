import { Component, inject, signal } from '@angular/core';
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

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
