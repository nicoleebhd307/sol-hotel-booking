import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { HomeContent } from '../../services/home-content';
import { ApiService } from '../../services/api.service';
import { BookingData } from '../../models/home.models';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, StickyNavbar, SiteFooter, DatePipe],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
})
export class BookingDetail implements OnInit {
  private readonly homeContent = inject(HomeContent);
  private readonly apiService = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  protected readonly booking = signal<BookingData | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBooking(id);
    } else {
      this.isLoading.set(false);
      this.errorMessage.set('No booking ID provided');
    }
  }

  private loadBooking(id: string): void {
    this.apiService.getBookingById(id).subscribe({
      next: (response) => {
        this.booking.set(response.booking);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Booking not found');
      }
    });
  }

  getNights(): number {
    const b = this.booking();
    if (!b) return 0;
    const diff = new Date(b.check_out).getTime() - new Date(b.check_in).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  goBack(): void {
    this.router.navigate(['/search-booking']);
  }
}
