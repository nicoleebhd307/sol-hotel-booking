import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StickyNavbar } from '../sticky-navbar/sticky-navbar';
import { SiteFooter } from '../rooms/site-footer/site-footer';
import { HomeContent } from '../../services/home-content';

@Component({
  selector: 'app-search-booking',
  standalone: true,
  imports: [CommonModule, StickyNavbar, SiteFooter],
  templateUrl: './search-booking.html',
  styleUrl: './search-booking.css',
})
export class SearchBooking {
  private readonly homeContent = inject(HomeContent);
  
  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  onSearchBooking(event: any) {
    event.preventDefault();
    // Handle search logic here
  }
}
