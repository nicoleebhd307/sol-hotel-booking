import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { input } from '@angular/core';
import { AvailabilityField } from '../../../models/home.models';

@Component({
  selector: 'app-availability-bar',
  imports: [MatIconModule],
  templateUrl: './availability-bar.html',
  styleUrl: './availability-bar.css',
})
export class AvailabilityBar {
  readonly fields = input.required<AvailabilityField[]>();
}
