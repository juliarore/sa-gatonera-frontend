import { Component } from '@angular/core';
import { FeaturedCats } from './featured-cats/featured-cats';
import { Hero } from './hero/hero';

@Component({
  imports: [Hero, FeaturedCats],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {}
