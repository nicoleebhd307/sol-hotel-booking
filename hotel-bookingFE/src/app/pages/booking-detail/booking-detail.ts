import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { SiteFooter } from '../../components/rooms/site-footer/site-footer';
import { HomeContent } from '../../services/home-content';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, StickyNavbar, SiteFooter],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
})
export class BookingDetail {
  private readonly homeContent = inject(HomeContent);
  private readonly apiService = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  constructor() {
    // Placeholder for booking detail page
    // Will be implemented with full booking details display
  }

  goBack(): void {
    this.router.navigate(['/search-booking']);
  }
}
