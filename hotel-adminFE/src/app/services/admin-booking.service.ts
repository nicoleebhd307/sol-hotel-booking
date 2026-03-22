import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { AdminBooking, AdminBookingListResponse, AdminBookingStatus, RefundRequest } from '../models/admin-booking.model';

@Injectable({
  providedIn: 'root',
})
export class AdminBookingService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  getBookings(params?: { status?: AdminBookingStatus | 'all'; date?: string; search?: string }): Observable<AdminBookingListResponse> {
    const query = new URLSearchParams();

    if (params?.status) {
      query.set('status', params.status);
    }

    if (params?.date) {
      query.set('date', params.date);
    }

    if (params?.search) {
      query.set('search', params.search);
    }

    const suffix = query.toString() ? `?${query}` : '';
    return this.http.get<AdminBookingListResponse>(`${this.apiUrl}/bookings${suffix}`, { transferCache: false });
  }

  getBookingDetail(bookingId: string): Observable<{ success: boolean; data: AdminBooking }> {
    return this.http.get<{ success: boolean; data: AdminBooking }>(`${this.apiUrl}/bookings/${bookingId}`, { transferCache: false });
  }

  updateBooking(bookingId: string, payload: Partial<Pick<AdminBooking, 'customerName' | 'phone' | 'roomType' | 'checkInDate' | 'checkOutDate' | 'depositAmount'>>): Observable<{ success: boolean; data: AdminBooking }> {
    return this.http.patch<{ success: boolean; data: AdminBooking }>(`${this.apiUrl}/bookings/${bookingId}`, payload);
  }

  updateBookingStatus(bookingId: string, status: AdminBookingStatus): Observable<{ success: boolean; data: AdminBooking }> {
    return this.http.patch<{ success: boolean; data: AdminBooking }>(`${this.apiUrl}/bookings/${bookingId}/status`, { status });
  }

  addExtraServices(bookingId: string, services: Array<{ name: string; amount: number }>): Observable<{ success: boolean; data: AdminBooking }> {
    return this.http.patch<{ success: boolean; data: AdminBooking }>(`${this.apiUrl}/bookings/${bookingId}/services`, { services });
  }

  cancelBooking(bookingId: string, reason?: string): Observable<{ success: boolean; data: AdminBooking }> {
    return this.http.delete<{ success: boolean; data: AdminBooking }>(`${this.apiUrl}/bookings/${bookingId}`, {
      body: { reason: reason || '' },
    });
  }

  getRefundRequests(status: 'all' | 'pending' | 'confirmed' | 'rejected' = 'all'): Observable<{ success: boolean; data: RefundRequest[] }> {
    return this.http.get<{ success: boolean; data: RefundRequest[] }>(`${this.apiUrl}/refunds?status=${status}`, { transferCache: false });
  }

  confirmRefund(bookingId: string, note = ''): Observable<{ success: boolean; data: { refund: RefundRequest; booking: AdminBooking } }> {
    return this.http.patch<{ success: boolean; data: { refund: RefundRequest; booking: AdminBooking } }>(`${this.apiUrl}/refunds/${bookingId}/confirm`, { note });
  }

  rejectRefund(bookingId: string, note = ''): Observable<{ success: boolean; data: { refund: RefundRequest; booking: AdminBooking } }> {
    return this.http.patch<{ success: boolean; data: { refund: RefundRequest; booking: AdminBooking } }>(`${this.apiUrl}/refunds/${bookingId}/reject`, { note });
  }
}
