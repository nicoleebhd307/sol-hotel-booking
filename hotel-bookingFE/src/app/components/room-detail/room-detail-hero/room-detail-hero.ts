import { Component, input, inject, computed, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RoomCard, RoomType } from '../../../models/home.models';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-room-detail-hero',
  imports: [CommonModule, MatIconModule],
  templateUrl: './room-detail-hero.html',
  styleUrl: './room-detail-hero.css'
})
export class RoomDetailHero implements OnInit {
  readonly room = input.required<RoomCard>();
  
  private readonly apiService = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);
  
  // Fallback room type with multiple images
  private readonly fallbackRoomType: RoomType = {
    _id: '69b6db49281523151e4315d2',
    name: 'Deluxe Executive Suite',
    area: 35,
    price_per_night: 120,
    bed_options: ['1 double bed', '2 single beds'],
    capacity: { adults: 2, children: 2 },
    description: 'Admire stunning views of the ocean from our stylish Executive Suite',
    amenities: [
      'High-Speed WiFi',
      'Climate Control System',
      '4K Smart Entertainment System',
      'Curated Mini bar',
      'Panoramic Ocean view',
      'Private Lanai/Balcony'
    ],
    rate_includes: [],
    service_charge: 5,
    vat: true,
    image: [
      'https://i0.wp.com/stellamarisbeachdanang.com/wp-content/uploads/2019/06/SMB-Executive-Suite-1.jpg?fit=1800%2C1200&ssl=1',
      'https://i0.wp.com/stellamarisbeachdanang.com/wp-content/uploads/2019/06/SMB-Executive-Suite-Overview.jpg?fit=1800%2C1200&ssl=1',
      'https://i0.wp.com/stellamarisbeachdanang.com/wp-content/uploads/2019/06/SMB-Executive-Suite-Room-Corner.jpg?fit=1800%2C1200&ssl=1',
      'https://i0.wp.com/stellamarisbeachdanang.com/wp-content/uploads/2019/06/SMB-Executive-Suite-Bathtub.jpg?fit=1800%2C1200&ssl=1'
    ]
  };
  
  // Track current room type and image index
  protected readonly currentRoomType = signal<RoomType>(this.fallbackRoomType);
  protected readonly currentImageIndex = signal(0);
  
  protected readonly currentImageUrl = computed(() => {
    const roomType = this.currentRoomType();
    const imageIndex = this.currentImageIndex();
    if (roomType && roomType.image && roomType.image.length > imageIndex) {
      return roomType.image[imageIndex];
    }
    return this.room().imageUrl;
  });
  
  protected readonly totalImages = computed(() => {
    const roomType = this.currentRoomType();
    return roomType?.image?.length || 0;
  });
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRoomTypes();
    }
  }
  
  private loadRoomTypes(): void {
    this.apiService.getRoomTypes().subscribe({
      next: (response) => {
        console.log('Room types loaded from API:', response);
        if (response.data && response.data.length > 0) {
          // Use the first room type from API (or we could let user select)
          this.currentRoomType.set(response.data[0]);
          this.currentImageIndex.set(0);
          console.log('Room type updated, images available:', this.totalImages());
        }
      },
      error: (error) => {
        console.error('Error loading room types, using fallback:', error);
      }
    });
  }
  
  previousRoom(): void {
    const currentIndex = this.currentImageIndex();
    const totalImages = this.totalImages();
    
    console.log('Previous clicked, current image index:', currentIndex, 'total images:', totalImages);
    
    if (totalImages === 0) {
      console.warn('No images available');
      return;
    }
    
    if (currentIndex > 0) {
      this.currentImageIndex.set(currentIndex - 1);
    } else {
      this.currentImageIndex.set(totalImages - 1);
    }
    console.log('New image index after previous:', this.currentImageIndex());
  }
  
  nextRoom(): void {
    const currentIndex = this.currentImageIndex();
    const totalImages = this.totalImages();
    
    console.log('Next clicked, current image index:', currentIndex, 'total images:', totalImages);
    
    if (totalImages === 0) {
      console.warn('No images available');
      return;
    }
    
    if (currentIndex < totalImages - 1) {
      this.currentImageIndex.set(currentIndex + 1);
    } else {
      this.currentImageIndex.set(0);
    }
    console.log('New image index after next:', this.currentImageIndex());
  }

  getAmenityIcon(amenity: string): string {
    const amenityLower = amenity.toLowerCase();
    
    if (amenityLower.includes('wifi') || amenityLower.includes('wi-fi')) return 'wifi';
    if (amenityLower.includes('climate') || amenityLower.includes('air') || amenityLower.includes('conditioning')) return 'ac_unit';
    if (amenityLower.includes('entertainment') || amenityLower.includes('tv') || amenityLower.includes('smart')) return 'smart_display';
    if (amenityLower.includes('mini bar') || amenityLower.includes('bar')) return 'local_bar';
    if (amenityLower.includes('panoramic') || amenityLower.includes('view') || amenityLower.includes('ocean')) return 'visibility';
    if (amenityLower.includes('lanai') || amenityLower.includes('balcony') || amenityLower.includes('private')) return 'deck';
    if (amenityLower.includes('24/7') || amenityLower.includes('service')) return 'room_service';
    if (amenityLower.includes('bathroom') || amenityLower.includes('shower')) return 'bathroom';
    if (amenityLower.includes('bed') || amenityLower.includes('tv')) return 'single_bed';
    
    return 'check_circle';
  }
}
