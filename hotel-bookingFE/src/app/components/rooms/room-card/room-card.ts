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
}
