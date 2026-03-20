import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-details-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-details-card.html',
  styleUrl: './booking-details-card.css',
})
export class BookingDetailsCard {
  readonly booking = input.required<any>();
  readonly statusClass = input<string>('');
  readonly guestsLabel = input<string>('');
  readonly inclusions = input<string[]>([]);
}

