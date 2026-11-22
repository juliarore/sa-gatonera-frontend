import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResponsiveImage } from '../../../../shared/components/responsive-image/responsive-image';

@Component({
  imports: [RouterLink, ResponsiveImage],
  selector: 'app-find-companion',
  templateUrl: './find-companion.html',
  styleUrl: './find-companion.scss',
})
export class FindCompanion {}
