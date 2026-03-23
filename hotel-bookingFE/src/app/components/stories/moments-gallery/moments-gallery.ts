import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-moments-gallery',
  imports: [CommonModule],
  templateUrl: './moments-gallery.html',
  styleUrl: './moments-gallery.css',
})
export class MomentsGallery {
  images = [
    '/assets/images/moment1.jpg',
    '/assets/images/moment 2.jpg',
    '/assets/images/moment 3.jpg',
    '/assets/images/moment 4.jpg',
    '/assets/images/moment 5.jpg',
    '/assets/images/moment 6.jpg',
    '/assets/images/moment 7.jpg',
  ];
}
