import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResponsiveImage } from '../../../../shared/components/responsive-image/responsive-image';
import { SPLIT_IMAGE_SIZES } from '../../../../shared/components/responsive-image/sizes';
import { FIND_COMPANION_PATH } from '../../../../shared/navigation/routes';

@Component({
  imports: [RouterLink, ResponsiveImage],
  selector: 'app-find-companion',
  templateUrl: './find-companion.html',
  styleUrl: './find-companion.scss',
})
export class FindCompanion {
  protected readonly findCompanionPath = FIND_COMPANION_PATH;
  protected readonly imageSizes = SPLIT_IMAGE_SIZES;
}
