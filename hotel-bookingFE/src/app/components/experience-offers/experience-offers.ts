import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';

export interface ExperienceItem {
  label: string;
  italic?: boolean;
  image: string;
}

@Component({
  selector: 'app-experience-offers',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './experience-offers.html',
})
export class ExperienceOffersComponent {
  readonly arrowRightIcon = ArrowRight;

  activeIndex = signal(1);

  experiences: ExperienceItem[] = [
    {
      label: 'Resort',
      image:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80',
    },
    {
      label: 'Villa',

      image:
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=500&q=80',
    },
    {
      label: 'Penthouse',
      image:
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=500&q=80',
    },
    {
      label: 'The Private Beach',
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80',
    },
    {
      label: 'Apartment',
      image:
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=500&q=80',
    },
  ];
}
