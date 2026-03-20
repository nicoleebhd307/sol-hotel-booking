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
    path: 'search-booking',
    loadComponent: () => import('./components/search-booking/search-booking').then(m => m.SearchBooking),
  },
  {
    path: 'booking/:id',
    loadComponent: () => import('./pages/booking-detail/booking-detail').then(m => m.BookingDetail),
  },
  {
    path: 'booking-confirmation',
    loadComponent: () => import('./pages/booking-confirmation/booking-confirmation').then(m => m.BookingConfirmation),
  },
  {
    path: 'cancel-booking',
    loadComponent: () => import('./pages/cancel-booking/cancel-booking').then(m => m.CancelBooking),
  },
  { path: '**', redirectTo: '' },
];
