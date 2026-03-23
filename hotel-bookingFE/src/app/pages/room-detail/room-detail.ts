import { Component, inject, AfterViewInit, PLATFORM_ID, signal, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { RoomsContent } from '../../services/rooms-content';
import { HomeContent } from '../../services/home-content';
import { RoomCard, RoomType } from '../../models/home.models';
import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { RoomDetailHero } from '../../components/room-detail/room-detail-hero/room-detail-hero';
import { CloserLook } from '../../components/room-detail/closer-look/closer-look';
import { StayGuidelines } from '../../components/room-detail/stay-guidelines/stay-guidelines';
import { RelatedRooms } from '../../components/room-detail/related-rooms/related-rooms';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { BookingCta } from '../../components/home/booking-cta/booking-cta';

@Component({
  selector: 'app-room-detail',
  imports: [
    CommonModule,
    StickyNavbar,
    RoomDetailHero,
    CloserLook,
    StayGuidelines,
    RelatedRooms,

    SiteFooter
  ],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.css',
})
export class RoomDetail implements OnInit, AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly roomsContent = inject(RoomsContent);
  private readonly homeContent = inject(HomeContent);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroy$ = new Subject<void>();

  protected readonly selectedRoom = signal<RoomCard | null>(null);
  protected readonly selectedRoomType = signal<RoomType | null>(null);
  protected readonly relatedRooms = signal<RoomCard[]>([]);
  protected readonly isLoading = signal(true);

  protected readonly footerData = this.homeContent.getHomePageData().footer;
  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;

  ngOnInit(): void {
    // Scroll to top of page
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    // Subscribe to route param changes (not just snapshot)
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const roomTypeId = paramMap.get('id');
      
      if (roomTypeId) {
        this.isLoading.set(true);
        this.loadRoomType(roomTypeId);
        this.loadRelatedRooms(roomTypeId);
      } else {
        // Check for room name in query param as fallback
        const roomName = this.route.snapshot.queryParamMap.get('name');
        if (roomName) {
          this.isLoading.set(true);
          this.loadRoomTypeByName(roomName);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollAnimations();
    }
  }

  private loadRoomType(id: string): void {
    this.apiService.getRoomTypeById(id).subscribe({
      next: (roomType) => {
        this.selectedRoomType.set(roomType);
        this.selectedRoom.set(this.mapRoomTypeToCard(roomType));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load room type:', err);
        this.isLoading.set(false);
      }
    });
  }

  private loadRoomTypeByName(name: string): void {
    // Fetch all room types and find the one matching the name
    this.apiService.getRoomTypes().subscribe({
      next: (roomTypes) => {
        const roomType = roomTypes.find(rt => rt.name?.toLowerCase() === name.toLowerCase());
        if (roomType) {
          this.selectedRoomType.set(roomType);
          this.selectedRoom.set(this.mapRoomTypeToCard(roomType));
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private loadRelatedRooms(currentId: string | null): void {
    this.roomsContent.getRoomsDataFromAPI().subscribe((rooms) => {
      this.relatedRooms.set(rooms.filter(r => r.roomTypeId !== currentId).slice(0, 3));
    });
  }

  private mapRoomTypeToCard(rt: RoomType): RoomCard {
    const firstImage = rt.image?.find(i => !!i) || rt.images?.find(i => !!i);
    const adults = rt.capacity?.adults || 0;
    const children = rt.capacity?.children || 0;
    return {
      id: 1,
      roomTypeId: rt._id,
      title: rt.name || 'Room',
      description: rt.description || '',
      imageUrl: firstImage || '/assets/images/Scenic Ocean View.png',
      priceFrom: rt.price_per_night || 0,
      roomType: rt.name || 'Standard',
      beds: rt.bed_options?.length || 1,
      bedOptions: rt.bed_options || [],
      sqft: rt.area || 0,
      guest: adults + children,
      capacityAdults: adults,
      capacityChildren: children,
      viewType: rt.view || 'No View',
      amenities: []
    };
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

  onBookNow(): void {
    const roomTypeId = this.route.snapshot.paramMap.get('id');
    if (!roomTypeId) return;

    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 1);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 1);

    this.router.navigate(['/booking-create'], {
      queryParams: {
        roomTypeId,
        checkIn: checkIn.toISOString().slice(0, 10),
        checkOut: checkOut.toISOString().slice(0, 10),
        adults: 2,
        children: 0
      }
    });
  }
}
