import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RoomCard } from '../../../models/home.models';

@Component({
  selector: 'app-room-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css'
})
export class RoomCardComponent {
  readonly room = input.required<RoomCard>();
}
