import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomType, ApiResponse } from '../models/home.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Room Types
  getRoomTypes(): Observable<ApiResponse<RoomType[]>> {
    return this.http.get<ApiResponse<RoomType[]>>(`${this.API_URL}/room-types`);
  }

  getRoomTypeById(id: string): Observable<ApiResponse<RoomType>> {
    return this.http.get<ApiResponse<RoomType>>(`${this.API_URL}/room-types/${id}`);
  }

  // Rooms
  getRooms(filters?: {
    status?: string;
    beach_view?: boolean;
    is_active?: boolean;
  }): Observable<ApiResponse<Room[]>> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.beach_view !== undefined) params = params.set('beach_view', filters.beach_view);
    if (filters?.is_active !== undefined) params = params.set('is_active', filters.is_active);

    return this.http.get<ApiResponse<Room[]>>(`${this.API_URL}/rooms`, { params });
  }

  getAvailableRooms(): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(`${this.API_URL}/rooms/available`);
  }

  getRoomById(id: string): Observable<ApiResponse<Room>> {
    return this.http.get<ApiResponse<Room>>(`${this.API_URL}/rooms/${id}`);
  }

  // Bookings
  searchBookingById(bookingId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/bookings/search/${bookingId}`);
  }

  getBookingById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/bookings/${id}`);
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.API_URL}/health`);
  }
}
