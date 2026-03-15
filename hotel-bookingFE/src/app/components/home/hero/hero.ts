import { Component } from '@angular/core';
import { input } from '@angular/core';
import { HomePageData } from '../../../models/home.models';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  readonly data = input.required<HomePageData['hero']>();
}
