/**
 * Dashboard Models
 * Centralized interfaces and types for the dashboard
 */

export interface DashboardStats {
  label: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down';
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface UserInfo {
  name: string;
  role: string;
  profileImage: string;
}
