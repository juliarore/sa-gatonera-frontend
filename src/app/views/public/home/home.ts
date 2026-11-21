import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResponsiveImage } from '../../../shared/components/responsive-image/responsive-image';

@Component({
  imports: [RouterLink, ResponsiveImage],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
