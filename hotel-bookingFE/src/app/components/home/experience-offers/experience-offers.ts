import { Component, signal, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomePageData } from '../../../models/home.models';

@Component({
  selector: 'app-experience-offers',
  imports: [RouterLink],
  templateUrl: './experience-offers.html',
  styleUrl: './experience-offers.css',
})
export class ExperienceOffers {
  readonly data = input.required<HomePageData['offers']>();
  readonly hoveredIndex = signal<number | null>(null);

  readonly displayImage = computed(() => {
    const items = this.data().items;
    const hovered = this.hoveredIndex();
    if (hovered !== null && items[hovered]?.imageUrl) {
      return items[hovered].imageUrl!;
    }
    const active = items.find(i => i.active);
    return active?.imageUrl ?? this.data().imageUrl;
  });

  isHighlighted(i: number): boolean {
    const hovered = this.hoveredIndex();
    if (hovered !== null) return hovered === i;
    return this.data().items[i]?.active === true;
  }
}
