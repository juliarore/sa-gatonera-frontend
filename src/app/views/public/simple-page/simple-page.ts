import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-simple-page',
  templateUrl: './simple-page.html',
  styleUrl: './simple-page.scss',
})
export class SimplePage {
  protected readonly title: string = inject(ActivatedRoute).snapshot.data['title'];
}
