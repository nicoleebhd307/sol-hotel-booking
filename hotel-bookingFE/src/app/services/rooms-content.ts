import { Injectable } from '@angular/core';
import { RoomCard } from '../models/home.models';

@Injectable({
  providedIn: 'root'
})
export class RoomsContent {
  private readonly roomsData: RoomCard[] = [
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
    },
    {
      id: 4,
      title: 'Deluxe Ocean View',
      description: 'Premium accommodation with stunning ocean vistas and modern amenities.',
      imageUrl: 'https://images.unsplash.com/photo-1578926078328-123027fbd351?auto=format&fit=crop&w=500&q=60',
      priceFrom: 750,
      roomType: 'Deluxe',
      beds: 2,
      sqft: 480,
      guest: 2,
      viewType: 'Ocean Front',
      amenities: []
    },
    {
      id: 5,
      title: 'Tropical Garden Room',
      description: 'Surrounded by lush gardens and tropical plants for a serene experience.',
      imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=500&q=60',
      priceFrom: 550,
      roomType: 'Standard',
      beds: 1,
      sqft: 350,
      guest: 2,
      viewType: 'Garden View',
      amenities: []
    },
    {
      id: 6,
      title: 'City View Penthouse',
      description: 'Modern luxury suite with panoramic city views and premium services.',
      imageUrl: 'https://images.unsplash.com/photo-1566665556112-d4ca8472633d?auto=format&fit=crop&w=500&q=60',
      priceFrom: 1200,
      roomType: 'Penthouse',
      beds: 3,
      sqft: 900,
      guest: 6,
      viewType: 'City View',
      amenities: []
    },
    {
      id: 7,
      title: 'Family Beach Suite',
      description: 'Perfect for families with spacious rooms and easy beach access.',
      imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=500&q=60',
      priceFrom: 950,
      roomType: 'Suite',
      beds: 2,
      sqft: 650,
      guest: 4,
      viewType: 'Ocean Front',
      amenities: []
    },
    {
      id: 8,
      title: 'Sunset View Room',
      description: 'Witness breathtaking sunsets from your private balcony each evening.',
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-5586191db46f?auto=format&fit=crop&w=500&q=60',
      priceFrom: 700,
      roomType: 'Deluxe',
      beds: 1,
      sqft: 420,
      guest: 2,
      viewType: 'Ocean Front',
      amenities: []
    },
    {
      id: 9,
      title: 'Lagoon View Bungalow',
      description: 'Intimate bungalow with direct access to the crystal clear lagoon waters.',
      imageUrl: 'https://images.unsplash.com/photo-1539135336991-7e798aabda3e?auto=format&fit=crop&w=500&q=60',
      priceFrom: 900,
      roomType: 'Standard',
      beds: 1,
      sqft: 380,
      guest: 2,
      viewType: 'Ocean Front',
      amenities: []
    },
    {
      id: 10,
      title: 'Premium Garden Suite',
      description: 'Luxury suite surrounded by tropical gardens with private pool access.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=60',
      priceFrom: 1100,
      roomType: 'Suite',
      beds: 2,
      sqft: 620,
      guest: 4,
      viewType: 'Garden View',
      amenities: []
    },
    {
      id: 11,
      title: 'Elite Ocean Suite',
      description: 'Our most exclusive offering with white-glove service and premium amenities.',
      imageUrl: 'https://images.unsplash.com/photo-1590080876900-9c47a94fb241?auto=format&fit=crop&w=500&q=60',
      priceFrom: 1600,
      roomType: 'Penthouse',
      beds: 3,
      sqft: 1000,
      guest: 6,
      viewType: 'Ocean Front',
      amenities: []
    },
    {
      id: 12,
      title: 'Cozy Standard Room',
      description: 'Comfortable and affordable accommodation with all essential amenities.',
      imageUrl: 'https://images.unsplash.com/photo-1502086223922-666e0c737a0e?auto=format&fit=crop&w=500&q=60',
      priceFrom: 450,
      roomType: 'Standard',
      beds: 1,
      sqft: 300,
      guest: 1,
      viewType: 'City View',
      amenities: []
    }
  ];

  getRoomsData(): RoomCard[] {
    return this.roomsData;
  }
}
