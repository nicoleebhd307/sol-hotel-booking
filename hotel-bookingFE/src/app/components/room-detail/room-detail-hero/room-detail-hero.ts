import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RoomCard, RoomType } from '../../../models/home.models';

@Component({
  selector: 'app-room-detail-hero',
  imports: [CommonModule, MatIconModule],
  templateUrl: './room-detail-hero.html',
  styleUrl: './room-detail-hero.css'
})
export class RoomDetailHero {
  readonly room = input.required<RoomCard>();
  readonly roomType = input<RoomType | null>(null);

  protected readonly currentImageIndex = signal(0);

  protected readonly images = computed(() => {
    const rt = this.roomType();
    if (rt?.image?.length) return rt.image;
    if (rt?.images?.length) return rt.images;
    return [];
  });

  protected readonly currentImageUrl = computed(() => {
    const imgs = this.images();
    const idx = this.currentImageIndex();
    if (imgs.length > idx) return imgs[idx];
    return this.room().imageUrl;
  });

  protected readonly totalImages = computed(() => this.images().length);

  protected readonly amenities = computed(() => {
    return this.roomType()?.amenities || [];
  });

  previousRoom(): void {
    const total = this.totalImages();
    if (total === 0) return;
    const idx = this.currentImageIndex();
    this.currentImageIndex.set(idx > 0 ? idx - 1 : total - 1);
  }

  nextRoom(): void {
    const total = this.totalImages();
    if (total === 0) return;
    const idx = this.currentImageIndex();
    this.currentImageIndex.set(idx < total - 1 ? idx + 1 : 0);
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
