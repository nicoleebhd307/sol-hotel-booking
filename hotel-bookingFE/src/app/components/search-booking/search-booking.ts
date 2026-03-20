import { Component, inject, signal, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StickyNavbar } from '../sticky-navbar/sticky-navbar';
import { SiteFooter } from '../site-footer/site-footer';
import { HomeContent } from '../../services/home-content';
import { ApiService } from '../../services/api.service';
import { BookingData } from '../../models/home.models';

@Component({
  selector: 'app-search-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, StickyNavbar, SiteFooter],
  templateUrl: './search-booking.html',
  styleUrl: './search-booking.css',
})
export class SearchBooking implements AfterViewInit {
  private readonly homeContent = inject(HomeContent);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  
  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  protected readonly searchQuery = signal<string>('');
  protected readonly searchResults = signal<BookingData[]>([]);
  protected readonly errorMessage = signal<string>('');
  protected readonly isLoading = signal<boolean>(false);

  onSearchBooking(event: any) {
    event.preventDefault();
    this.errorMessage.set('');
    this.searchResults.set([]);
    const query = this.searchQuery().trim();
    
    if (!query) {
      this.errorMessage.set('Please enter a Booking ID');
      return;
    }

    this.isLoading.set(true);

    this.apiService.searchBookings(query).subscribe({
      next: (bookings) => {
        this.isLoading.set(false);
        if (bookings.length > 0) {
          this.router.navigate(['/booking', bookings[0]._id]);
        } else {
          this.errorMessage.set(`No booking found with ID: ${query}`);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(`No booking found with ID: ${query}`);
      }
    });
  }

  viewBooking(id: string): void {
    this.router.navigate(['/booking', id]);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.errorMessage.set('');
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollAnimations();
    }
  }

  private setupScrollAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15
    });

    const elements = document.querySelectorAll('.reveal-scale, .reveal-up, .reveal-left, .reveal-right');
    elements.forEach((el) => observer.observe(el));
  }
}
