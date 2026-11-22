import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COLLABORATE_OPTIONS } from '../../../../shared/collaborate/collaborate-options';
import { COLLABORATE_PATH } from '../../../../shared/navigation/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-home-collaborate',
  templateUrl: './home-collaborate.html',
  styleUrl: './home-collaborate.scss',
})
export class HomeCollaborate {
  protected readonly options = COLLABORATE_OPTIONS;
  protected readonly path = COLLABORATE_PATH;
}
