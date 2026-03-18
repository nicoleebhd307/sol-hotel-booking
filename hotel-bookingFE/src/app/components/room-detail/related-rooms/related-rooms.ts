import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomCard } from '../../../models/home.models';
import { RoomCardComponent } from '../../rooms/room-card/room-card';

@Component({
  selector: 'app-related-rooms',
  imports: [CommonModule, RoomCardComponent],
  templateUrl: './related-rooms.html',
  styleUrl: './related-rooms.css'
})
export class RelatedRooms {
  readonly rooms = input.required<RoomCard[]>();
  protected readonly relatedRooms = computed(() => this.rooms().slice(0, 3));
}
