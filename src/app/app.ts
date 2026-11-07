import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageFocusService } from './core/page-focus.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly pageFocus = inject(PageFocusService);
}
