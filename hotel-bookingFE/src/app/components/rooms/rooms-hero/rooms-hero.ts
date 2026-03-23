import { Component } from '@angular/core';
import { AvailabilityBar } from '../../home/availability-bar/availability-bar';

@Component({
  selector: 'app-rooms-hero',
  imports: [AvailabilityBar],
  templateUrl: './rooms-hero.html',
  styleUrl: './rooms-hero.css',
})
export class RoomsHero {
  readonly title = 'Rooms & Suites';
  readonly subtitle = 'EXPERIENCE TIMELESS ELEGANCE IN OUR CAREFULLY DESIGNED ROOMS';
}
