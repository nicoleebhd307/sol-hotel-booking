import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { input } from '@angular/core';
import { HomePageData } from '../../../models/home.models';

@Component({
  selector: 'app-news-section',
  imports: [MatIconModule],
  templateUrl: './news-section.html',
  styleUrl: './news-section.css',
})
export class NewsSection {
  readonly data = input.required<HomePageData['news']>();
}
