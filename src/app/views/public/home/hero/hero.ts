import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResponsiveImage } from '../../../../shared/components/responsive-image/responsive-image';

@Component({
  imports: [RouterLink, ResponsiveImage],
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {}
