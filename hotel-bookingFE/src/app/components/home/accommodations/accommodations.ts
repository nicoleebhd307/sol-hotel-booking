import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { input } from '@angular/core';
import { AccommodationCard } from '../../../models/home.models';

@Component({
  selector: 'app-accommodations',
  imports: [NgClass],
  templateUrl: './accommodations.html',
  styleUrl: './accommodations.css',
})
export class Accommodations {
  readonly cards = input.required<AccommodationCard[]>();
}
