import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { input } from '@angular/core';
import { AccommodationCard } from '../../../models/home.models';

@Component({
  selector: 'app-accommodations',
  imports: [MatIconModule],
  templateUrl: './accommodations.html',
  styleUrl: './accommodations.css',
})
export class Accommodations {
  readonly cards = input.required<AccommodationCard[]>();
}
