import { Component } from '@angular/core';
import { input } from '@angular/core';
import { HomePageData } from '../../../models/home.models';
import { AvailabilityBar } from '../availability-bar/availability-bar';

@Component({
  selector: 'app-hero',
  imports: [AvailabilityBar],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  readonly data = input.required<HomePageData['hero']>();
}
