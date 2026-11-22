import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResponsiveImage } from '../../../../shared/components/responsive-image/responsive-image';
import { ADOPTION_PROCESS_PATH, CATALOG_PATH } from '../../../../shared/navigation/routes';

@Component({
  imports: [RouterLink, ResponsiveImage],
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  protected readonly catalogPath = CATALOG_PATH;
  protected readonly adoptionProcessPath = ADOPTION_PROCESS_PATH;
}
