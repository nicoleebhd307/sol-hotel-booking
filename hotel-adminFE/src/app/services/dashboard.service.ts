import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
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
  id: number;
  guestName: string;
  room: string;
  time: string;
  roomType: string;
}

export interface CheckOutGuest {
  id: number;
  guestName: string;
  room: string;
  status: string;
  amount: number;
  checkoutTime: string;
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

interface AdminBooking {
  _id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out' | 'completed';
  check_in: string;
  check_out: string;
  createdAt: string;
  totalPrice: number;
  extraCharge?: number;
  customer_id?: {
    name?: string;
  };
  rooms?: Array<{
    room_id?: {
      room_number?: string;
      room_type_id?: {
        name?: string;
      };
    };
  }>;
}

interface ListBookingsResponse {
  count: number;
  items: AdminBooking[];
}

interface BookingStatsResponse {
  byStatus: Array<{ _id: string; count: number }>;
  totals: {
    count: number;
    totalRevenue: number;
    totalDeposits: number;
  } | null;
}

interface RoomItem {
  status: 'available' | 'maintenance' | 'occupied';
  is_active: boolean;
  room_type_id?: {
    name?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly adminApiUrl = `${API_CONFIG.baseUrl}/api/admin`;
  private readonly roomsApiUrl = `${API_CONFIG.baseUrl}/api/rooms`;

  constructor(private http: HttpClient) {}

  private isSameDay(dateValue: string, refDate: Date): boolean {
    const date = new Date(dateValue);
    return (
      date.getFullYear() === refDate.getFullYear() &&
      date.getMonth() === refDate.getMonth() &&
      date.getDate() === refDate.getDate()
    );
  }

  private formatTime(dateValue: string): string {
    const date = new Date(dateValue);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  private toSuccess<T>(data: T): ApiResponse<T> {
    return { success: true, data };
  }

  /**
   * Fetch dashboard summary statistics
   */
  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    return forkJoin({
      bookings: this.http.get<ListBookingsResponse>(`${this.adminApiUrl}/bookings`, { params: { limit: '200' } }),
      rooms: this.http.get<RoomItem[]>(this.roomsApiUrl),
      stats: this.http.get<BookingStatsResponse>(`${this.adminApiUrl}/stats/bookings`),
    }).pipe(
      map(({ bookings, rooms, stats }) => {
        const today = new Date();
        const activeBookings = bookings.items.filter((item) => item.status !== 'cancelled');

        const totalBookingsToday = bookings.items.filter((item) => this.isSameDay(item.createdAt, today)).length;
        const checkIn = activeBookings.filter((item) => this.isSameDay(item.check_in, today)).length;
        const checkOut = activeBookings.filter((item) => this.isSameDay(item.check_out, today)).length;
        const availableRooms = rooms.filter((room) => room.is_active && room.status === 'available').length;

        const totalCount = Math.max(stats.totals?.count || bookings.count || 1, 1);
        const checkInPct = Math.round((checkIn / totalCount) * 100);
        const checkOutPct = Math.round((checkOut / totalCount) * 100);
        const availablePct = Math.round((availableRooms / Math.max(rooms.length, 1)) * 100);

        return this.toSuccess<DashboardSummary>({
          totalBookingsToday,
          checkIn,
          checkOut,
          availableRooms,
          bookingStats: { percentage: Math.min(totalBookingsToday * 5, 100), trend: totalBookingsToday > 0 ? 'up' : 'down' },
          checkInStats: { percentage: checkInPct, trend: checkIn > 0 ? 'up' : 'down' },
          checkOutStats: { percentage: checkOutPct, trend: checkOut > 0 ? 'up' : 'down' },
          availableRoomsStats: { percentage: availablePct, trend: availableRooms > 0 ? 'up' : 'down' },
        });
      })
    );
  }

  /**
   * Fetch check-in guests
   */
  getCheckIns(): Observable<ApiResponse<CheckInGuest[]>> {
    return this.http
      .get<ListBookingsResponse>(`${this.adminApiUrl}/bookings`, { params: { limit: '200' } })
      .pipe(
        map((response) => {
          const today = new Date();
          const items = response.items
            .filter(
              (item) =>
                item.status !== 'cancelled' &&
                (item.status === 'confirmed' || item.status === 'pending' || item.status === 'checked_in') &&
                this.isSameDay(item.check_in, today)
            )
            .slice(0, 10)
            .map((item, index) => ({
              id: index + 1,
              guestName: item.customer_id?.name || 'Guest',
              room: item.rooms?.[0]?.room_id?.room_number || '-',
              time: this.formatTime(item.check_in),
              roomType: item.rooms?.[0]?.room_id?.room_type_id?.name || '-',
            }));

          return this.toSuccess(items);
        })
      );
  }

  /**
   * Fetch check-out guests
   */
  getCheckOuts(): Observable<ApiResponse<CheckOutGuest[]>> {
    return this.http
      .get<ListBookingsResponse>(`${this.adminApiUrl}/bookings`, { params: { limit: '200' } })
      .pipe(
        map((response) => {
          const today = new Date();
          const items = response.items
            .filter((item) => item.status !== 'cancelled' && this.isSameDay(item.check_out, today))
            .slice(0, 10)
            .map((item, index) => ({
              id: index + 1,
              guestName: item.customer_id?.name || 'Guest',
              room: item.rooms?.[0]?.room_id?.room_number || '-',
              status: item.status === 'checked_out' || item.status === 'completed' ? 'Paid' : 'Pending',
              amount: Math.round((item.totalPrice || 0) + (item.extraCharge || 0)),
              checkoutTime: this.formatTime(item.check_out),
            }));

          return this.toSuccess(items);
        })
      );
  }

  /**
   * Fetch room availability
   */
  getRoomAvailability(): Observable<ApiResponse<RoomAvailability[]>> {
    return this.http.get<RoomItem[]>(this.roomsApiUrl).pipe(
      map((rooms) => {
        const grouped = new Map<string, { total: number; available: number }>();

        for (const room of rooms) {
          if (!room.is_active) {
            continue;
          }

          const roomTypeName = room.room_type_id?.name || 'Other';
          const current = grouped.get(roomTypeName) || { total: 0, available: 0 };
          current.total += 1;
          if (room.status === 'available') {
            current.available += 1;
          }
          grouped.set(roomTypeName, current);
        }

        const result: RoomAvailability[] = Array.from(grouped.entries()).map(([roomType, value]) => ({
          roomType,
          available: value.available,
          total: value.total,
          percentage: value.total > 0 ? Math.round((value.available / value.total) * 100) : 0,
        }));

        return this.toSuccess(result);
      })
    );
  }

  /**
   * Fetch manager dashboard summary statistics
   */
  getManagerSummary(): Observable<ApiResponse<ManagerDashboardSummary>> {
    return forkJoin({
      bookings: this.http.get<ListBookingsResponse>(`${this.adminApiUrl}/bookings`, { params: { limit: '200' } }),
      rooms: this.http.get<RoomItem[]>(this.roomsApiUrl),
      stats: this.http.get<BookingStatsResponse>(`${this.adminApiUrl}/stats/bookings`),
    }).pipe(
      map(({ bookings, rooms, stats }) => {
        const today = new Date();
        const revenueToday = bookings.items
          .filter((item) => item.status !== 'cancelled' && this.isSameDay(item.createdAt, today))
          .reduce((sum, item) => sum + (item.totalPrice || 0) + (item.extraCharge || 0), 0);

        const occupiedRooms = rooms.filter((room) => room.is_active && room.status === 'occupied').length;
        const totalRooms = Math.max(rooms.filter((room) => room.is_active).length, 1);
        const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

        const averageDailyRate = occupiedRooms > 0 ? Math.round(revenueToday / occupiedRooms) : 0;
        const pendingApprovals = bookings.items.filter((item) => item.status === 'pending').length;

        const statsTotalCount = Math.max(stats.totals?.count || bookings.count || 1, 1);

        return this.toSuccess<ManagerDashboardSummary>({
          revenueToday: Math.round(revenueToday),
          occupancyRate,
          averageDailyRate,
          pendingApprovals,
          revenueStats: {
            percentage: Math.min(Math.round((revenueToday / Math.max(stats.totals?.totalRevenue || 1, 1)) * 100), 100),
            trend: revenueToday > 0 ? 'up' : 'down',
          },
          occupancyStats: {
            percentage: occupancyRate,
            trend: occupancyRate >= 50 ? 'up' : 'down',
          },
          averageRateStats: {
            percentage: averageDailyRate > 0 ? Math.min(Math.round((averageDailyRate / 100) * 10), 100) : 0,
            trend: averageDailyRate > 0 ? 'up' : 'down',
          },
          pendingStats: {
            percentage: Math.round((pendingApprovals / statsTotalCount) * 100),
            trend: pendingApprovals > 0 ? 'up' : 'down',
          },
        });
      })
    );
  }
}
