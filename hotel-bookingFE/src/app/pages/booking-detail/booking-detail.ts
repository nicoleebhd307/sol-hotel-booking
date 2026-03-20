import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { BookingConfirmationHero } from '../../components/booking-confirmation-hero/booking-confirmation-hero';
import { BookingDetailsCard } from '../../components/booking-details-card/booking-details-card';
import { BookingInclusions } from '../../components/booking-inclusions/booking-inclusions';
import { ManageBookingPanel } from '../../components/manage-booking-panel/manage-booking-panel';
import { HomeContent } from '../../services/home-content';
import { ApiService } from '../../services/api.service';
import { BookingData } from '../../models/home.models';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, StickyNavbar, SiteFooter, BookingConfirmationHero, BookingDetailsCard, BookingInclusions, ManageBookingPanel],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
})
export class BookingDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly homeContent = inject(HomeContent);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  protected readonly booking = signal<BookingData | null>(null);
  protected readonly payment = signal<any>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getBookingById(id).subscribe({
        next: ({ booking, payment }) => {
          this.booking.set(booking);
          this.payment.set(payment);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Booking not found. Please check your Booking ID and try again.');
        }
      });
    } else {
      this.isLoading.set(false);
      this.errorMessage.set('No booking ID provided.');
    }
  }

  get nights(): number {
    const b = this.booking();
    if (!b) return 0;
    const ms = new Date(b.check_out).getTime() - new Date(b.check_in).getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  }

  get guestsLabel(): string {
    const g = this.booking()?.guests;
    if (!g) return '';
    const parts: string[] = [];
    if (g.adults) parts.push(`${g.adults} Adult${g.adults > 1 ? 's' : ''}`);
    if (g.children) parts.push(`${g.children} Child${g.children > 1 ? 'ren' : ''}`);
    return parts.join(', ') || 'N/A';
  }

  get statusClass(): string {
    const s = this.booking()?.status?.toLowerCase();
    if (s === 'paid' || s === 'confirmed') return 'bg-[#9ce8ff] text-[#086a7e]';
    if (s === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  }

  get roomName(): string {
    const b = this.booking();
    if (!b || !b.rooms?.length) return 'Reservation';
    return b.rooms[0]?.room_id?.room_type_id?.name || 'Room';
  }

  get inclusions(): string[] {
    const b = this.booking();
    if (!b || !b.rooms?.length) return [];
    return b.rooms[0]?.room_id?.room_type_id?.rate_includes ?? [];
  }

  get nightsTotal(): number {
    const b = this.booking();
    if (!b) return 0;
    return b.totalPrice - (b.extraCharge ?? 0);
  }

  onCancelBooking(): void {
    const id = this.booking()?._id;
    if (id) {
      this.router.navigate(['/cancel-booking'], { queryParams: { bookingId: id } });
    }
  }

  onDownloadPDF(): void {
    console.log('Downloading booking confirmation PDF...');
  }

  backToSearch(): void {
    this.router.navigate(['/search-booking']);
  }
}
