import { Component } from '@angular/core';
import { FeaturedCats } from './featured-cats/featured-cats';
import { FindCompanion } from './find-companion/find-companion';
import { Hero } from './hero/hero';

@Component({
  imports: [Hero, FeaturedCats, FindCompanion],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {}
