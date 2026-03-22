import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface DashboardSummary {
  totalBookingsToday: number;
  checkIn: number;
  checkOut: number;
  availableRooms: number;
  bookingStats: { percentage: number; trend: string };
  checkInStats: { percentage: number; trend: string };
  checkOutStats: { percentage: number; trend: string };
  availableRoomsStats: { percentage: number; trend: string };
}

export interface CheckInGuest {
  bookingId: string;
  id: number;
  guestName: string;
  room: string;
  time: string;
  roomType: string;
  status: string;
}

export interface CheckOutGuest {
  bookingId: string;
  id: number;
  guestName: string;
  room: string;
  status: string;
  amount?: number;
  checkoutTime?: string;
}

export interface RoomAvailability {
  roomType: string;
  available: number;
  total: number;
  percentage: number;
}

export interface ManagerDashboardSummary {
  revenueToday: number;
  occupancyRate: number;
  averageDailyRate: number;
  pendingApprovals: number;
  revenueStats: { percentage: number; trend: string };
  occupancyStats: { percentage: number; trend: string };
  averageRateStats: { percentage: number; trend: string };
  pendingStats: { percentage: number; trend: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch dashboard summary statistics
   */
  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.apiUrl}/summary`);
  }

  /**
   * Fetch check-in guests
   */
  getCheckIns(): Observable<ApiResponse<CheckInGuest[]>> {
    return this.http.get<ApiResponse<CheckInGuest[]>>(`${this.apiUrl}/checkins`);
  }

  /**
   * Fetch check-out guests
   */
  getCheckOuts(): Observable<ApiResponse<CheckOutGuest[]>> {
    return this.http.get<ApiResponse<CheckOutGuest[]>>(`${this.apiUrl}/checkouts`);
  }

  /**
   * Fetch room availability
   */
  getRoomAvailability(): Observable<ApiResponse<RoomAvailability[]>> {
    return this.http.get<ApiResponse<RoomAvailability[]>>(`${this.apiUrl}/room-availability`);
  }

  /**
   * Fetch manager dashboard summary statistics
   */
  getManagerSummary(): Observable<ApiResponse<ManagerDashboardSummary>> {
    return this.http.get<ApiResponse<ManagerDashboardSummary>>(`${this.apiUrl}/manager-summary`);
  }
}
