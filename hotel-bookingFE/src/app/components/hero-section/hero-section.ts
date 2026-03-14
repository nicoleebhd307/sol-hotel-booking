import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, Compass, CalendarDays, Sparkles, Building2, Tag, ArrowRight } from 'lucide-angular';

export interface CategoryItem {
  icon: any;
  label: string;
}

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './hero-section.html',
})
export class HeroSectionComponent {
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  readonly arrowIcon = ArrowRight;

  activeSlide = signal(0);

  slides = [
    'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
  ];

  categories: CategoryItem[] = [
    { icon: Compass,      label: 'Explore Resort' },
    { icon: CalendarDays, label: 'Our Events' },
    { icon: Sparkles,     label: 'Our Experiences' },
    { icon: Building2,    label: 'Our Resorts' },
    { icon: Tag,          label: 'Special Offers' },
  ];

  prev() {
    this.activeSlide.update((i) => (i > 0 ? i - 1 : this.slides.length - 1));
  }

  next() {
    this.activeSlide.update((i) => (i < this.slides.length - 1 ? i + 1 : 0));
  }
}
