import { Component, input } from '@angular/core';
import { AvailabilityField } from '../../../models/home.models';

@Component({
  selector: 'app-rooms-hero',
  imports: [],
  templateUrl: './rooms-hero.html',
  styleUrl: './rooms-hero.css',
})
export class RoomsHero {
  readonly title = 'Rooms & Suites';
  readonly subtitle = 'EXPERIENCE TIMELESS ELEGANCE IN OUR CAREFULLY DESIGNED ROOMS';
  readonly fields = input<AvailabilityField[]>([]);
}
