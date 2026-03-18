import { Component, inject, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RoomsContent } from '../../services/rooms-content';
import { HomeContent } from '../../services/home-content';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { RoomDetailHero } from '../../components/room-detail/room-detail-hero/room-detail-hero';
import { CloserLook } from '../../components/room-detail/closer-look/closer-look';
import { StayGuidelines } from '../../components/room-detail/stay-guidelines/stay-guidelines';
import { RelatedRooms } from '../../components/room-detail/related-rooms/related-rooms';
import { SiteFooter } from '../../components/rooms/site-footer/site-footer';
import { CtaBanner } from '../../components/room-detail/cta-banner/cta-banner';

@Component({
  selector: 'app-room-detail',
  imports: [
    CommonModule,
    StickyNavbar,
    RoomDetailHero,
    CloserLook,
    StayGuidelines,
    RelatedRooms,
    CtaBanner,
    SiteFooter
  ],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.css',
})
export class RoomDetail implements AfterViewInit {
  private readonly roomsContent = inject(RoomsContent);
  private readonly homeContent = inject(HomeContent);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly rooms = this.roomsContent.getRoomsData();
  protected readonly selectedRoom = this.rooms[0];
  protected readonly footerData = this.homeContent.getHomePageData().footer;
  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;

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
