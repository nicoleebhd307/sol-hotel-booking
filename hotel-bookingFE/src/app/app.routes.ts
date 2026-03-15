import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { Rooms } from './pages/rooms/rooms';
import { RoomDetail } from './pages/room-detail/room-detail';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'rooms', component: Rooms },
  { path: 'rooms/:id', component: RoomDetail },
  { path: '**', redirectTo: '' },
];
