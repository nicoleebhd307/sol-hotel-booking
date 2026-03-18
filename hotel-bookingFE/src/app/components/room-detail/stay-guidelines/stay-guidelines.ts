import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stay-guidelines',
  imports: [CommonModule],
  templateUrl: './stay-guidelines.html',
  styleUrl: './stay-guidelines.css'
})
export class StayGuidelines {
  readonly guidelines = [
    { title: 'CHECK-IN / CHECK-OUT', items: ['Check-in: 2:00 PM', 'Check-out: 11:00 AM'] },
    { title: 'CANCELLATION', items: ['Free cancellation up to 7 days before arrival', 'Non-refundable bookings cannot be modified'] },
    { title: 'EXTRA GUESTS', items: ['Additional guests: €50 per night', 'Maximum occupancy 2 adults, 1 child per room'] }
  ];
}
