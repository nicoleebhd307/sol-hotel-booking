import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { SiteFooter } from '../../components/rooms/site-footer/site-footer';
import { HomeContent } from '../../services/home-content';

@Component({
  selector: 'app-cancel-booking',
  standalone: true,
  imports: [CommonModule, StickyNavbar, SiteFooter],
  templateUrl: './cancel-booking.html',
  styleUrl: './cancel-booking.css',
})
export class CancelBooking {
  private readonly router = inject(Router);
  private readonly homeContent = inject(HomeContent);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  protected readonly cancellationPolicy = [
    'Free cancellation up to 14 days before check-in',
    'If cancelled 7-13 days before, 50% refund applies',
    'Cancellations within 7 days forfeit the full payment',
    'You will receive notification confirmation via email'
  ];

  onKeepBooking() {
    this.router.navigate(['/booking-confirmation']);
  }

  onConfirmCancellation() {
    alert('Booking cancelled successfully. Please check your email for refund details.');
    this.router.navigate(['/']);
  }
}

