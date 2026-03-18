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
    {
      title: 'CHECK-IN / OUT',
      description: [
        'Check-In: 2:00 PM',
        'Check-Out: 12:00 AM',
        'Early check-in and late check-out subject to availability.'
      ]
    },
    {
      title: 'CANCELLATION',
      description: [
        'Cancel up to 72 hours before arrival for a full refund. Cancellations within 72 hours are subject to a one-night room and tax charge.'
      ]
    },
    {
      title: 'EXTRA GUESTS',
      description: [
        'Children under 12 stay free using existing bedding. Extra person charge of $75/night applies for guests 13 and older.'
      ]
    }
  ];
}
