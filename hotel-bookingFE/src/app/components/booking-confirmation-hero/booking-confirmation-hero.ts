import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-confirmation-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-confirmation-hero.html',
  styleUrl: './booking-confirmation-hero.css',
})
export class BookingConfirmationHero {
  protected readonly bookingId = 'BK001';
}

