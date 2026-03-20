import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-details-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-details-card.html',
  styleUrl: './booking-details-card.css',
})
export class BookingDetailsCard {
  protected readonly booking = {
    roomName: 'The Oceanfront Sanctuary',
    location: '🌴 Azure Sands Private Island, Maldives',
    status: 'PAID',
    statusColor: 'bg-blue-100 text-blue-800',
    checkInDate: 'December 14, 2024',
    checkInTime: 'From 3:00 PM',
    checkOutDate: 'December 21, 2024',
    checkOutTime: 'Until 12:00 PM',
    guests: '2 Adults, 1 Child',
    inclusions: [
      'Daily Champagne Breakfast',
      'Personal Villa Host',
      'Complimentary Water Activities',
      'Airport Transfers'
    ]
  };
}

