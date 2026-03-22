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
    // Navigate to room-detail page with room title as query parameter
    this.router.navigate(['/rooms', 'search'], { queryParams: { name: card.title } });
  }

  navigateToStories(): void {
    // Navigate to stories/our-stories page
    this.router.navigate(['/stories']);
  }
}
