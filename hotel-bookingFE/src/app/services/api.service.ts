import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomType, ServiceItem, BookingData } from '../models/home.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Room Types
  getRoomTypes(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(`${this.API_URL}/rooms/types`);
  }

  getRoomTypeById(id: string): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.API_URL}/rooms/types/${id}`);
  }

  // Rooms
  getRooms(filters?: {
    roomTypeId?: string;
  }): Observable<Room[]> {
    let params = new HttpParams();
    if (filters?.roomTypeId) params = params.set('roomTypeId', filters.roomTypeId);

    return this.http.get<Room[]>(`${this.API_URL}/rooms`, { params });
  }

  getAvailableRooms(checkIn: string, checkOut: string, roomTypeId?: string): Observable<{ checkIn: string; checkOut: string; count: number; rooms: Room[] }> {
    let params = new HttpParams().set('checkIn', checkIn).set('checkOut', checkOut);
    if (roomTypeId) params = params.set('roomTypeId', roomTypeId);
    return this.http.get<{ checkIn: string; checkOut: string; count: number; rooms: Room[] }>(`${this.API_URL}/rooms/available`, { params });
  }

  // Services
  getServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${this.API_URL}/services`);
  }

  // Bookings
  searchBookings(query: string): Observable<BookingData[]> {
    return this.http.get<BookingData[]>(`${this.API_URL}/bookings/search/${encodeURIComponent(query)}`);
  }

  getBookingById(id: string): Observable<{ booking: BookingData; payment: any }> {
    return this.http.get<{ booking: BookingData; payment: any }>(`${this.API_URL}/bookings/${id}`);
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/bookings/${id}/cancel`, {});
  }

  // Health check
  healthCheck(): Observable<{ status: string; uptime: number }> {
    return this.http.get<{ status: string; uptime: number }>(`http://localhost:5000/health`);
  }
}
