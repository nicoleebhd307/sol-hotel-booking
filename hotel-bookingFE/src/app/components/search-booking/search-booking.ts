import { Component, inject, signal, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StickyNavbar } from '../sticky-navbar/sticky-navbar';
import { SiteFooter } from '../rooms/site-footer/site-footer';
import { HomeContent } from '../../services/home-content';
import { ApiService } from '../../services/api.service';

export interface BookingDetail {
  _id: string;
  bookingId: string;
  roomType: string;
  roomNumber: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  status: string;
  specialRequests?: string;
}

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

  protected readonly bookingId = signal<string>('');
  protected readonly foundBooking = signal<BookingDetail | null>(null);
  protected readonly errorMessage = signal<string>('');
  protected readonly isLoading = signal<boolean>(false);

  onSearchBooking(event: any) {
    event.preventDefault();
    this.errorMessage.set('');
    const id = this.bookingId().trim();
    
    if (!id) {
      this.errorMessage.set('Please enter a booking ID');
      return;
    }

    this.isLoading.set(true);

    this.apiService.searchBookingById(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.foundBooking.set(response.data);
          // Navigate to booking detail page after short delay
          setTimeout(() => {
            this.router.navigate(['/booking', response.data._id]);
          }, 500);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.foundBooking.set(null);
        this.errorMessage.set(`No booking found with ID: ${id}`);
      }
    });
  }

  clearSearch() {
    this.bookingId.set('');
    this.foundBooking.set(null);
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
