import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RoomCard } from '../../../models/home.models';

@Component({
  selector: 'app-room-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css'
})
export class RoomCardComponent {
  private readonly router = inject(Router);
  readonly room = input.required<RoomCard>();

  viewDetails(): void {
    const roomTypeId = this.room().roomTypeId;
    if (roomTypeId) {
      this.router.navigate(['/rooms', roomTypeId]);
    }
  }

  bookNow(): void {
    const roomTypeId = this.room().roomTypeId;
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
