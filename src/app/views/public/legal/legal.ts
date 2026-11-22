import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class Legal {
  protected readonly title: string = inject(ActivatedRoute).snapshot.data['title'];
}
