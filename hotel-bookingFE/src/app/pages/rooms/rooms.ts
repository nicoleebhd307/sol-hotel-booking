import { Component, inject, AfterViewInit, PLATFORM_ID, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';

import { RoomsHero } from '../../components/rooms/rooms-hero/rooms-hero';
import { RoomsFilterComponent, FilterState } from '../../components/rooms/rooms-filter/rooms-filter';
import { RoomsGridComponent } from '../../components/rooms/rooms-grid/rooms-grid';
import { ExperienceSection } from '../../components/rooms/experience-section/experience-section';
import { RoomsContent } from '../../services/rooms-content';
import { HomeContent } from '../../services/home-content';
import { RoomCard } from '../../models/home.models';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { BookingCta } from '../../components/home/booking-cta/booking-cta';

@Component({
  selector: 'app-rooms',
  imports: [
    CommonModule,
    StickyNavbar,
    RoomsHero,
    RoomsFilterComponent,
    RoomsGridComponent,
    ExperienceSection,
    BookingCta,
    SiteFooter
  ],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms implements OnInit, AfterViewInit {
  private readonly roomsContent = inject(RoomsContent);
  private readonly homeContent = inject(HomeContent);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly roomsList = signal<RoomCard[]>([]);
  protected readonly footerData = this.homeContent.getHomePageData().footer;
  protected readonly bookingCtaData = this.homeContent.getHomePageData().bookingCta;
  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;

  private readonly filters = signal<FilterState>({});

  protected readonly filteredRooms = computed(() => {
    const activeFilters = this.filters();
    return this.roomsList().filter(room => this.matchesFilters(room, activeFilters));
  });

  protected readonly resultCount = computed(() => this.filteredRooms().length);
  protected readonly totalRooms = computed(() => this.roomsList().length);

  ngOnInit(): void {
    this.roomsContent
      .getRoomsDataFromAPI()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rooms) => this.roomsList.set(rooms));
  }

  onFiltersChange(filters: FilterState): void {
    this.filters.set(filters);
  }

  private matchesFilters(room: any, filters: FilterState): boolean {
    if (!filters || Object.keys(filters).length === 0) return true;

    if (filters.roomType && room.roomType !== filters.roomType) return false;

    if (filters.priceRange) {
      const price = room.priceFrom;
      if (filters.priceRange === '1,000,000 - 1,200,000' && (price < 1000000 || price > 1200000)) return false;
      if (filters.priceRange === '1,200,000 - 1,400,000' && (price < 1200000 || price > 1400000)) return false;
      if (filters.priceRange === '1,400,000 - 1,700,000' && (price < 1400000 || price > 1700000)) return false;
      if (filters.priceRange === '1,700,000+' && price < 1700000) return false;
    }

    if (filters.guests) {
      const guests = room.guest;
      if (filters.guests === '1-2' && guests > 2) return false;
      if (filters.guests === '2-3' && (guests < 2 || guests > 3)) return false;
      if (filters.guests === '3-4' && (guests < 3 || guests > 4)) return false;
      if (filters.guests === '4+' && guests < 4) return false;
    }

    if (filters.view && room.viewType !== filters.view) return false;

    return true;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollAnimations();
    }
  }

  private setupScrollAnimations(): void {
    const revealSelectors = '.reveal-up, .reveal-left, .reveal-right, .reveal-scale';
    const revealElements = document.querySelectorAll(revealSelectors);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((element) => observer.observe(element));
  }
}


