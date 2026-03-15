import { Component, afterNextRender } from '@angular/core';
import { input } from '@angular/core';
import { HomePageData } from '../../models/home.models';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { Hero } from '../../components/home/hero/hero';
import { AvailabilityBar } from '../../components/home/availability-bar/availability-bar';
import { Intro } from '../../components/home/intro/intro';
import { Accommodations } from '../../components/home/accommodations/accommodations';
import { ExperienceOffers } from '../../components/home/experience-offers/experience-offers';
import { GuestExperiences } from '../../components/home/guest-experiences/guest-experiences';
import { NewsSection } from '../../components/home/news-section/news-section';
import { BookingCta } from '../../components/home/booking-cta/booking-cta';
import { SiteFooter } from '../../components/home/site-footer/site-footer';

@Component({
  selector: 'app-main-layout',
  imports: [
    StickyNavbar,
    Hero,
    AvailabilityBar,
    Intro,
    Accommodations,
    ExperienceOffers,
    GuestExperiences,
    NewsSection,
    BookingCta,
    SiteFooter,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  readonly data = input.required<HomePageData>();

  constructor() {
    afterNextRender(() => {
      this.initScrollReveal();
    });
  }

  private initScrollReveal() {
    const revealSelectors = '.reveal-up, .reveal-left, .reveal-right, .reveal-scale';
    const elements = document.querySelectorAll(revealSelectors);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // Unobserve after animation so it doesn't re-trigger
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
  }
}
