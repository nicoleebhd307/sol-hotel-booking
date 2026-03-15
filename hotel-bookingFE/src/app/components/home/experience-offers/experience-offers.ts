import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { input } from '@angular/core';
import { HomePageData } from '../../../models/home.models';

@Component({
  selector: 'app-experience-offers',
  imports: [MatIconModule],
  templateUrl: './experience-offers.html',
  styleUrl: './experience-offers.css',
})
export class ExperienceOffers {
  readonly data = input.required<HomePageData['offers']>();
}
