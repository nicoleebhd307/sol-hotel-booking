import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsContent } from '../../services/rooms-content';
import { HomeContent } from '../../services/home-content';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { RoomDetailHero } from '../../components/room-detail/room-detail-hero/room-detail-hero';
import { CloserLook } from '../../components/room-detail/closer-look/closer-look';
import { StayGuidelines } from '../../components/room-detail/stay-guidelines/stay-guidelines';
import { RelatedRooms } from '../../components/room-detail/related-rooms/related-rooms';
import { SiteFooter } from '../../components/rooms/site-footer/site-footer';
import { CtaBanner } from '../../components/rooms/cta-banner/cta-banner';

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
export class RoomDetail {
  private readonly roomsContent = inject(RoomsContent);
  private readonly homeContent = inject(HomeContent);

  protected readonly rooms = this.roomsContent.getRoomsData();
  protected readonly selectedRoom = this.rooms[0];
  protected readonly footerData = this.homeContent.getHomePageData().footer;
  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
}
