import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RoomCard } from '../models/home.models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RoomsContent {
  private apiService = inject(ApiService);
  private http = inject(HttpClient);

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
      sqft: 450,
      guest: 2,
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
      sqft: 550,
      guest: 2,
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
      sqft: 750,
      guest: 4,
      viewType: 'Ocean Front',
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
    return this.apiService.getAvailableRooms().pipe(
      map(response => this.mapRoomsToCards(response.data)),
      catchError(() => {
        console.warn('API not available, using fallback data');
        return of(this.fallbackRoomsData);
      })
    );
  }

  private mapRoomsToCards(rooms: any[]): RoomCard[] {
    return rooms.map((room, index) => ({
      id: index + 1,
      title: room.roomType?.name || 'Room',
      description: room.roomType?.description || '',
      imageUrl: '/assets/images/Scenic Ocean View.png', // Default for now
      priceFrom: room.roomType?.price_per_night ? Math.floor(room.roomType.price_per_night / 1000) : 0,
      roomType: room.roomType?.name?.split(' ')[0] || 'Standard',
      beds: room.roomType?.bed_options?.length || 1,
      sqft: room.roomType?.area || 0,
      guest: room.roomType?.capacity?.adults || 1,
      viewType: room.beach_view ? 'Beach View' : 'Garden View',
      amenities: []
    }));
  }
}

