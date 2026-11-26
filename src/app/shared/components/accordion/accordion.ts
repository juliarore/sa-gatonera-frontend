import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Accordion {
  readonly panelId = input.required<string>();
  readonly label = input.required<string>();
  readonly count = input(0);
  readonly summary = input<string>();

  protected readonly expanded = signal(false);
}
