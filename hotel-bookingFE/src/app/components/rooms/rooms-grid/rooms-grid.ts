import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomCardComponent } from '../room-card/room-card';
import { RoomCard } from '../../../models/home.models';

@Component({
  selector: 'app-rooms-grid',
  imports: [CommonModule, RoomCardComponent],
  templateUrl: './rooms-grid.html',
  styleUrl: './rooms-grid.css'
})
export class RoomsGridComponent {
  readonly rooms = input.required<RoomCard[]>();
  readonly displayedRooms = computed(() => this.rooms().slice(0, 3));
}
