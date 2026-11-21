import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicHeader } from '../public-header/public-header';

@Component({
  imports: [RouterOutlet, PublicHeader],
  selector: 'app-public-layout',
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {
  protected readonly isMenuOpen = signal(false);
}
