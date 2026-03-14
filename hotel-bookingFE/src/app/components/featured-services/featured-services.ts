import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

export interface ServiceCard {
  id: number;
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-featured-services',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './featured-services.html',
})
export class FeaturedServicesComponent {
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;

  activeIndex = signal(1);

  services: ServiceCard[] = [
    {
      id: 1,
      title: 'Beach Front Lanai',
      description:
        'Experience the ultimate beachfront luxury. Our lanai opens directly onto the pristine sands with breathtaking ocean views.',
      image:
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      title: 'Ocean Front Lanai',
      description:
        'Wake up to panoramic ocean vistas. These spacious suites blend indoor elegance with the natural beauty of the Pacific.',
      image:
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      title: 'Dolphin Lanai',
      description:
        'Uniquely positioned alongside our private dolphin lagoon, offering an unmatched connection with nature and luxury.',
      image:
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 4,
      title: 'Golf Mountain View',
      description:
        'Nestled against manicured fairways, these suites offer serene golf course vistas and privileged course access.',
      image:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    },
  ];

  prev() {
    this.activeIndex.update((i) => Math.max(0, i - 1));
  }

  next() {
    this.activeIndex.update((i) => Math.min(this.services.length - 1, i + 1));
  }
}
