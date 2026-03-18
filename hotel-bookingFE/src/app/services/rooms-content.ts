import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RoomCard, RoomType } from '../models/home.models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RoomsContent {
  private apiService = inject(ApiService);

  // Fallback mock data if API is not available
  private readonly fallbackRoomsData: RoomCard[] = [
    {
      id: 1,
      title: 'Scenic Ocean View',
      description: 'Wake up to the rhythmic sounds of waves and a panoramic ocean view of the Pacific.',
      imageUrl: '/assets/images/Scenic Ocean View.png',
      priceFrom: 650,
      roomType: 'Deluxe',
      beds: 2,
      bedOptions: ['1 King Bed', '2 Twin Beds'],
      sqft: 450,
      guest: 2,
      capacityAdults: 2,
      capacityChildren: 0,
      viewType: 'Ocean Front',
      amenities: []
    },
    {
      id: 2,
      title: 'Garden Lanai Suite',
      description: 'Spacious and beautifully surrounded by lush tropical foliage in our historic lanai.',
      imageUrl: '/assets/images/Garden Lanai Suite.png',
      priceFrom: 830,
      roomType: 'Suite',
      beds: 1,
      bedOptions: ['1 King Bed'],
      sqft: 550,
      guest: 2,
      capacityAdults: 2,
      capacityChildren: 1,
      viewType: 'Garden View',
      amenities: [],
      featured: true
    },
    {
      id: 3,
      title: 'Beachfront Grand Suite',
      description: 'Steps away from the sand offering unparalleled luxury and direct lagoon access.',
      imageUrl: '/assets/images/Beachfront Grand Suite.png',
      priceFrom: 1450,
      roomType: 'Suite',
      beds: 2,
      bedOptions: ['2 Queen Beds'],
      sqft: 750,
      guest: 4,
      capacityAdults: 4,
      capacityChildren: 1,
      viewType: 'Ocean Front',
      amenities: []
    },
    {
      id: 4,
      title: 'Tropical Garden Deluxe',
      description: 'Surrounded by lush tropical gardens with direct access to the spa facilities and wellness center.',
      imageUrl: '/assets/images/Scenic Ocean View.png',
      priceFrom: 750,
      roomType: 'Deluxe',
      beds: 2,
      bedOptions: ['1 King Bed', '2 Twin Beds'],
      sqft: 480,
      guest: 2,
      capacityAdults: 2,
      capacityChildren: 1,
      viewType: 'Garden View',
      amenities: []
    },
    {
      id: 5,
      title: 'Lagoon Escape Suite',
      description: 'Intimate suite with direct lagoon views and private beach access, perfect for romantic getaways.',
      imageUrl: '/assets/images/Garden Lanai Suite.png',
      priceFrom: 950,
      roomType: 'Suite',
      beds: 1,
      bedOptions: ['1 King Bed'],
      sqft: 420,
      guest: 2,
      capacityAdults: 2,
      capacityChildren: 1,
      viewType: 'Lagoon View',
      amenities: []
    }
  ];

  getRoomsData(): RoomCard[] {
    // Return fallback data for now
    // Once API is integrated, use:
    // return this.apiService.getAvailableRooms().pipe(
    //   map(response => this.mapRoomsToCards(response.data))
    // ).toPromise();
    return this.fallbackRoomsData;
  }

  getRoomsDataFromAPI(): Observable<RoomCard[]> {
    return this.apiService.getRoomTypes().pipe(
      map((roomTypes) => this.mapRoomTypesToCards(roomTypes)),
      catchError(() => {
        console.warn('API not available, using fallback data');
        return of(this.fallbackRoomsData);
      })
    );
  }

  private mapRoomTypesToCards(roomTypes: RoomType[]): RoomCard[] {
    return roomTypes.map((roomType, index) => {
      const firstImage = roomType.image?.find((image) => !!image) || roomType.images?.find((image) => !!image);
      const capacityAdults = roomType.capacity?.adults || 0;
      const capacityChildren = roomType.capacity?.children || 0;
      return {
      id: index + 1,
      title: roomType.name || 'Room',
      description: roomType.description || '',
      imageUrl: firstImage || '/assets/images/Scenic Ocean View.png',
      priceFrom: roomType.price_per_night || 0,
      roomType: roomType.name?.split(' ')[0] || 'Standard',
      beds: roomType.bed_options?.length || 1,
      bedOptions: roomType.bed_options || [],
      sqft: roomType.area || 0,
      guest: capacityAdults + capacityChildren,
      capacityAdults,
      capacityChildren,
      viewType: this.normalizeView(roomType.view),
      amenities: []
      };
    });
  }

  private normalizeView(view?: string): string {
    const raw = (view || '').trim().toLowerCase();
    if (!raw || raw === 'none' || raw === 'no view' || raw === 'n/a') {
      return 'No View';
    }

    const titleCase = raw
      .replace(/[_-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return /view$/i.test(titleCase) ? titleCase : `${titleCase} View`;
  }
}

