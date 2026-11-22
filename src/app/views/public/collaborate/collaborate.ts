import { Component, ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, Scroll } from '@angular/router';
import { filter } from 'rxjs';
import { COLLABORATE_OPTIONS } from '../../../shared/collaborate/collaborate-options';

@Component({
  selector: 'app-collaborate-page',
  templateUrl: './collaborate.html',
  styleUrl: './collaborate.scss',
})
export class CollaboratePage {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly options = COLLABORATE_OPTIONS;

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event): event is Scroll => event instanceof Scroll && !!event.anchor),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.focusSectionTitle(event.anchor));
  }

  private focusSectionTitle(id: string | null): void {
    const section = Array.from(this.host.nativeElement.querySelectorAll('section')).find(
      (candidate) => candidate.id === id,
    );
    section?.querySelector('h2')?.focus({ preventScroll: true });
  }
}
