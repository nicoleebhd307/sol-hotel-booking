import { Component, inject, OnInit, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { HomeContent } from '../../services/home-content';
import { StoriesHero } from '../../components/stories/stories-hero/stories-hero';
import { AboutResort } from '../../components/stories/about-resort/about-resort';
import { MeetTeam } from '../../components/stories/meet-team/meet-team';
import { MomentsGallery } from '../../components/stories/moments-gallery/moments-gallery';
import { DiscoverHoiAn } from '../../components/stories/discover-hoi-an/discover-hoi-an';

@Component({
  selector: 'app-stories',
  imports: [
    CommonModule,
    StickyNavbar,
    StoriesHero,
    AboutResort,
    MeetTeam,
    DiscoverHoiAn,
    MomentsGallery,
    SiteFooter
  ],
  templateUrl: './stories.html',
  styleUrl: './stories.css',
})
export class Stories implements OnInit {
  private readonly homeContent = inject(HomeContent);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  constructor() {
    afterNextRender(() => {
      this.initScrollReveal();
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
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
