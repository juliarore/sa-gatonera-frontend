import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COLLABORATE_OPTIONS, COLLABORATE_PATH } from '../../../../shared/collaborate/collaborate-options';

@Component({
  imports: [RouterLink],
  selector: 'app-collaborate',
  templateUrl: './collaborate.html',
  styleUrl: './collaborate.scss',
})
export class Collaborate {
  protected readonly options = COLLABORATE_OPTIONS;
  protected readonly path = COLLABORATE_PATH;
}
