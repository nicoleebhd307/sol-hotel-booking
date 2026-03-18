import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GalleryImage {
  src: string;
  alt: string;
  span?: string; // For grid layout spanning
}

@Component({
  selector: 'app-closer-look',
  imports: [CommonModule],
  templateUrl: './closer-look.html',
  styleUrl: './closer-look.css'
})
export class CloserLook {
  readonly galleryImages: GalleryImage[] = [
    {
      src: 'https://solanbang.com/wp-content/uploads/2025/05/A745454.jpg',
      alt: 'Bedroom Detail',
      span: ''
    },
    {
      src: 'https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Deluxe-Streetview-Double-9.jpg',
      alt: 'Modern Bathroom',
      span: ''
    },
    {
      src: 'https://solanbang.com/wp-content/uploads/2025/05/A745430.jpg',
      alt: 'Balcony View',
      span: ''
    },
    {
      src: 'https://solanbang.com/wp-content/uploads/2025/03/DJI_0080.jpg',
      alt: 'Resort View',
      span: ''
    }
  ];
}
