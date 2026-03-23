import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { input } from '@angular/core';
import { AccommodationCard } from '../../../models/home.models';

@Component({
  selector: 'app-accommodations',
  imports: [CommonModule],
  templateUrl: './accommodations.html',
  styleUrl: './accommodations.css',
})
export class Accommodations {
  private readonly router = inject(Router);
  readonly cards = input<AccommodationCard[]>([]);

  navigateToDetail(card: AccommodationCard): void {
    // Navigate to room-detail page with room ID or name
    if (card.roomTypeId) {
      this.router.navigate(['/rooms', card.roomTypeId]);
    } else {
      // Fallback to query param if ID not available
      this.router.navigate(['/rooms', 'search'], { queryParams: { name: card.title } });
    }
  }

  bookNow(card: AccommodationCard): void {
    if (!card.roomTypeId) return;

    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 1);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 1);

    this.router.navigate(['/booking-create'], {
      queryParams: {
        roomTypeId: card.roomTypeId,
        checkIn: checkIn.toISOString().slice(0, 10),
        checkOut: checkOut.toISOString().slice(0, 10),
        adults: 2,
        children: 0
      }
    });
  }
}
