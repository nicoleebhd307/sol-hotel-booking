import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { input } from '@angular/core';
import { HomePageData } from '../../../models/home.models';

@Component({
  selector: 'app-guest-experiences',
  imports: [MatIconModule],
  templateUrl: './guest-experiences.html',
  styleUrl: './guest-experiences.css',
})
export class GuestExperiences {
  readonly data = input.required<HomePageData['testimonials']>();
}
