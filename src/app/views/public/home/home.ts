import { Component } from '@angular/core';
import { HomeAbout } from './home-about/home-about';
import { HomeCollaborate } from './home-collaborate/home-collaborate';
import { FeaturedCats } from './featured-cats/featured-cats';
import { FindCompanion } from './find-companion/find-companion';
import { Hero } from './hero/hero';

@Component({
  imports: [Hero, FeaturedCats, FindCompanion, HomeAbout, HomeCollaborate],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {}
