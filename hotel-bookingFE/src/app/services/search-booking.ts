import { Injectable } from '@angular/core';

export interface BookingGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BookingDetail {
  bookingId: string;
  roomType: string;
  roomNumber: string;
  guest: BookingGuest;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  status: string;
  specialRequests?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchBookingService {
  private mockBookings: BookingDetail[] = [
    {
      bookingId: 'BK001',
      roomType: 'Deluxe Suite',
      roomNumber: '301',
      guest: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567'
      },
      checkInDate: '2024-03-20',
      checkOutDate: '2024-03-24',
      nights: 4,
      pricePerNight: 650,
      totalPrice: 2750,
      status: 'Confirmed',
      specialRequests: 'Late checkout if available'
    },
    {
      bookingId: 'BK002',
      roomType: 'Ocean View Room',
      roomNumber: '502',
      guest: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+1 (555) 987-6543'
      },
      checkInDate: '2024-04-01',
      checkOutDate: '2024-04-05',
      nights: 4,
      pricePerNight: 450,
      totalPrice: 2100,
      status: 'Confirmed',
      specialRequests: 'High floor preferred'
    },
    {
      bookingId: 'BK003',
      roomType: 'Standard Room',
      roomNumber: '205',
      guest: {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.j@email.com',
        phone: '+1 (555) 456-7890'
      },
      checkInDate: '2024-03-25',
      checkOutDate: '2024-03-27',
      nights: 2,
      pricePerNight: 280,
      totalPrice: 610,
      status: 'Pending',
      specialRequests: 'Wheelchair accessible'
    },
    {
      bookingId: 'BK004',
      roomType: 'Luxury Presidential Suite',
      roomNumber: '801',
      guest: {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.w@email.com',
        phone: '+1 (555) 321-0987'
      },
      checkInDate: '2024-04-10',
      checkOutDate: '2024-04-13',
      nights: 3,
      pricePerNight: 1200,
      totalPrice: 3750,
      status: 'Confirmed',
      specialRequests: 'Champagne on arrival'
    }
  ];

  getBookingByID(bookingId: string): BookingDetail | null {
    return this.mockBookings.find(booking => booking.bookingId.toUpperCase() === bookingId.toUpperCase()) || null;
  }

  getAllBookings(): BookingDetail[] {
    return this.mockBookings;
  }
}
