import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { SiteFooter } from '../../components/rooms/site-footer/site-footer';
import { BookingConfirmationHero } from '../../components/booking-confirmation-hero/booking-confirmation-hero';
import { BookingDetailsCard } from '../../components/booking-details-card/booking-details-card';
import { ManageBookingPanel } from '../../components/manage-booking-panel/manage-booking-panel';
import { BookingInclusions } from '../../components/booking-inclusions/booking-inclusions';
import { HomeContent } from '../../services/home-content';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    StickyNavbar,
    BookingConfirmationHero,
    BookingDetailsCard,
    ManageBookingPanel,
    BookingInclusions,
    SiteFooter
  ],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.css',
})
export class BookingConfirmation {
  private readonly homeContent = inject(HomeContent);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;
}

