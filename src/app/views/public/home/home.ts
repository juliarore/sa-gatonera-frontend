import { Component } from '@angular/core';
import { About } from './about/about';
import { Collaborate } from './collaborate/collaborate';
import { FeaturedCats } from './featured-cats/featured-cats';
import { FindCompanion } from './find-companion/find-companion';
import { Hero } from './hero/hero';

@Component({
  imports: [Hero, FeaturedCats, FindCompanion, About, Collaborate],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {}
