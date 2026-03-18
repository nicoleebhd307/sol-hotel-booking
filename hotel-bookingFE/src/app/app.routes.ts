import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'stories',
    loadComponent: () => import('./pages/stories/stories').then(m => m.Stories),
  },
  {
    path: 'rooms',
    loadComponent: () => import('./pages/rooms/rooms').then(m => m.Rooms),
  },
  {
    path: 'room-detail',
    loadComponent: () => import('./pages/room-detail/room-detail').then(m => m.RoomDetail),
  },
  {
    path: 'rooms/:id',
    loadComponent: () => import('./pages/room-detail/room-detail').then(m => m.RoomDetail),
  },
  {
    path: 'find-booking',
    loadComponent: () => import('./pages/find-booking/find-booking').then(m => m.FindBooking),
  },
  { path: '**', redirectTo: '' },
];
