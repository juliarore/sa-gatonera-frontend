import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResponsiveImage } from '../../../../shared/components/responsive-image/responsive-image';
import { SPLIT_IMAGE_SIZES } from '../../../../shared/components/responsive-image/sizes';
import { ABOUT_PATH } from '../../../../shared/navigation/routes';

@Component({
  imports: [RouterLink, ResponsiveImage],
  selector: 'app-home-about',
  templateUrl: './home-about.html',
  styleUrl: './home-about.scss',
})
export class HomeAbout {
  protected readonly aboutPath = ABOUT_PATH;
  protected readonly imageSizes = SPLIT_IMAGE_SIZES;
}
