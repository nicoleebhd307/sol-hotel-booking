import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RoomCard } from '../../../models/home.models';

@Component({
  selector: 'app-room-detail-hero',
  imports: [CommonModule, MatIconModule],
  templateUrl: './room-detail-hero.html',
  styleUrl: './room-detail-hero.css'
})
export class RoomDetailHero {
  readonly room = input.required<RoomCard>();
}
