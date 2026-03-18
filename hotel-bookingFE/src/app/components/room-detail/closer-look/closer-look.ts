import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-closer-look',
  imports: [CommonModule],
  templateUrl: './closer-look.html',
  styleUrl: './closer-look.css'
})
export class CloserLook {
  readonly images = [
    '/assets/images/closer-look-1.jpg',
    '/assets/images/closer-look-2.jpg',
    '/assets/images/closer-look-3.jpg',
    '/assets/images/closer-look-4.jpg'
  ];
}
