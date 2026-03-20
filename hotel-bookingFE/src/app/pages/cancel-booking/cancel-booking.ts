import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { HomeContent } from '../../services/home-content';
import { ApiService } from '../../services/api.service';
import { SiteFooter } from '../../components/site-footer/site-footer';

@Component({
  selector: 'app-cancel-booking',
  standalone: true,
  imports: [CommonModule, StickyNavbar, SiteFooter],
  templateUrl: './cancel-booking.html',
  styleUrl: './cancel-booking.css',
})
export class CancelBooking implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly homeContent = inject(HomeContent);
  private readonly apiService = inject(ApiService);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  protected bookingId = signal<string>('');
  protected readonly isCancelling = signal<boolean>(false);

  protected readonly cancellationPolicy = [
    'Cancellations within 7 days before check-in are non-refundable',
    'Cancellations made more than 7 days before check-in receive a 50% refund of deposit',
    'You will receive notification confirmation via email'
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('bookingId');
    if (id) this.bookingId.set(id);
  }

  onKeepBooking(): void {
    const id = this.bookingId();
    if (id) {
      this.router.navigate(['/booking', id]);
    } else {
      this.router.navigate(['/search-booking']);
    }
  }

  onConfirmCancellation(): void {
    const id = this.bookingId();
    if (!id) {
      this.router.navigate(['/search-booking']);
      return;
    }
    this.isCancelling.set(true);
    this.apiService.cancelBooking(id).subscribe({
      next: () => {
        this.isCancelling.set(false);
        alert('Booking cancelled successfully. Please check your email for refund details.');
        this.router.navigate(['/search-booking']);
      },
      error: () => {
        this.isCancelling.set(false);
        alert('Failed to cancel booking. Please contact our support team.');
      }
    });
  }
}

