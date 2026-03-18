import { Component, inject, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { SiteFooter } from '../../components/rooms/site-footer/site-footer';
import { RoomsHero } from '../../components/rooms/rooms-hero/rooms-hero';
import { RoomsFilterComponent } from '../../components/rooms/rooms-filter/rooms-filter';
import { RoomsGridComponent } from '../../components/rooms/rooms-grid/rooms-grid';
import { ExperienceSection } from '../../components/rooms/experience-section/experience-section';
import { CtaBanner } from '../../components/rooms/cta-banner/cta-banner';
import { RoomsContent } from '../../services/rooms-content';
import { HomeContent } from '../../services/home-content';

@Component({
  selector: 'app-rooms',
  imports: [
    CommonModule,
    StickyNavbar,
    RoomsHero,
    RoomsFilterComponent,
    RoomsGridComponent,
    ExperienceSection,
    CtaBanner,
    SiteFooter
  ],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms implements AfterViewInit {
  private readonly roomsContent = inject(RoomsContent);
  private readonly homeContent = inject(HomeContent);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly roomsList = this.roomsContent.getRoomsData();
  protected readonly footerData = this.homeContent.getHomePageData().footer;
  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly availabilityFields = this.homeContent.getHomePageData().availabilityFields;

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


