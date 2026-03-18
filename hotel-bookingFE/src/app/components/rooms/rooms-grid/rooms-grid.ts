import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RoomCardComponent } from '../room-card/room-card';
import { RoomCard } from '../../../models/home.models';

@Component({
  selector: 'app-rooms-grid',
  imports: [CommonModule, RoomCardComponent, MatIconModule],
  templateUrl: './rooms-grid.html',
  styleUrl: './rooms-grid.css'
})
export class RoomsGridComponent {
  readonly rooms = input.required<RoomCard[]>();
  readonly itemsPerPage = 3;
  
  private readonly currentPage = signal(0);
  
  readonly displayedRooms = computed(() => {
    const startIndex = this.currentPage() * this.itemsPerPage;
    return this.rooms().slice(startIndex, startIndex + this.itemsPerPage);
  });

  readonly hasNextPage = computed(() => {
    return (this.currentPage() + 1) * this.itemsPerPage < this.rooms().length;
  });

  readonly hasPrevPage = computed(() => {
    return this.currentPage() > 0;
  });

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage()) {
      this.currentPage.update(p => p - 1);
    }
  }
}
