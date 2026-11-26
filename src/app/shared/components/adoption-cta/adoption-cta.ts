import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ADOPTION_PROCESS_PATH } from '../../navigation/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-adoption-cta',
  templateUrl: './adoption-cta.html',
  styleUrl: './adoption-cta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdoptionCta {
  protected readonly adoptionProcessPath = ADOPTION_PROCESS_PATH;
}
