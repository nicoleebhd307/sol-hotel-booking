import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-inclusions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-inclusions.html',
  styleUrl: './booking-inclusions.css',
})
export class BookingInclusions {
  protected readonly inclusions = [
    {
      title: 'Pre-book your Spa Journey',
      description: 'Ensure your preferred treatment times are secured before your arrival',
      icon: '✨',
      cta: 'EXPLORE RITUALS'
    },
    {
      title: 'Curated Dining',
      description: 'From private beach dinners to our signature underwater restaurant',
      icon: '🍽️',
      cta: 'VIEW MENUS'
    }
  ];

  onCTA(idx: number) {
    console.log(`CTA clicked for inclusion ${idx}`);
  }
}

