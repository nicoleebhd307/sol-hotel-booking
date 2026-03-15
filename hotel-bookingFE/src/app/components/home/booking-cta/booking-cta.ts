import { Component } from '@angular/core';
import { input } from '@angular/core';
import { HomePageData } from '../../../models/home.models';

@Component({
  selector: 'app-booking-cta',
  imports: [],
  templateUrl: './booking-cta.html',
  styleUrl: './booking-cta.css',
})
export class BookingCta {
  readonly data = input.required<HomePageData['bookingCta']>();
}
