import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking, BookingDraft, BookingFilterParams, CreateBookingDraftPayload, CreateBookingPayload } from '../models/booking.model';
import { API_CONFIG } from '../config/api.config';

const BOOKING_FALLBACK_MOCK: Booking[] = [
  {
    _id: 'AZ-1234',
    customer_id: 'CUST-0001',
    guest_name: 'Elena Rodriguez',
    guest_phone: '+34 600 123 456',
    room_type: 'Ocean Suite',
    room_number: 'Room 202',
    rooms: [{ room_id: 'R-202', price_per_night: 120 }],
    check_in: '2026-03-12',
    check_out: '2026-03-19',
    guests: 2,
    totalPrice: 840,
    depositAmount: 840,
    extraCharge: 0,
    status: 'confirmed',
    note: 'Late check-in',
    createdAt: '2026-03-01',
  },
  {
    _id: 'AZ-1235',
    customer_id: 'CUST-0002',
    guest_name: 'Marcus Chen',
    guest_phone: '+1 415 555 0199',
    room_type: 'Garden Villa',
    room_number: 'Villa 12',
    rooms: [{ room_id: 'V-12', price_per_night: 200 }],
    check_in: '2026-03-14',
    check_out: '2026-03-17',
    guests: 3,
    totalPrice: 600,
    depositAmount: 150,
    extraCharge: 0,
    status: 'pending',
    note: '',
    createdAt: '2026-03-02',
  },
  {
    _id: 'AZ-1236',
    customer_id: 'CUST-0003',
    guest_name: 'Sophia Laurent',
    guest_phone: '+33 123 45 67 89',
    room_type: 'Lagoon Penthouse',
    room_number: 'Penthouse A',
    rooms: [{ room_id: 'PH-A', price_per_night: 320 }],
    check_in: '2026-03-20',
    check_out: '2026-03-25',
    guests: 2,
    totalPrice: 1600,
    depositAmount: 0,
    extraCharge: 0,
    status: 'cancelled',
    note: 'Guest cancelled before arrival',
    createdAt: '2026-03-03',
  },
  {
    _id: 'AZ-1237',
    customer_id: 'CUST-0004',
    guest_name: 'Noah Wilson',
    guest_phone: '+1 312 555 0110',
    room_type: 'Ocean Suite',
    room_number: 'Room 206',
    rooms: [{ room_id: 'R-206', price_per_night: 120 }],
    check_in: '2026-03-18',
    check_out: '2026-03-21',
    guests: 2,
    totalPrice: 360,
    depositAmount: 360,
    extraCharge: 0,
    status: 'confirmed',
    note: '',
    createdAt: '2026-03-04',
  },
  {
    _id: 'AZ-1238',
    customer_id: 'CUST-0005',
    guest_name: 'Lina Park',
    guest_phone: '+82 10 2345 6789',
    room_type: 'Garden Villa',
    room_number: 'Villa 03',
    rooms: [{ room_id: 'V-03', price_per_night: 200 }],
    check_in: '2026-03-22',
    check_out: '2026-03-26',
    guests: 4,
    totalPrice: 800,
    depositAmount: 300,
    extraCharge: 50,
    status: 'checked_in',
    note: 'Extra bed requested',
    createdAt: '2026-03-05',
  },
  {
    _id: 'AZ-1239',
    customer_id: 'CUST-0006',
    guest_name: 'Rahul Sharma',
    guest_phone: '+91 98111 23456',
    room_type: 'Deluxe Room',
    room_number: 'Room 118',
    rooms: [{ room_id: 'R-118', price_per_night: 150 }],
    check_in: '2026-03-10',
    check_out: '2026-03-13',
    guests: 2,
    totalPrice: 450,
    depositAmount: 450,
    extraCharge: 0,
    status: 'checked_out',
    note: '',
    createdAt: '2026-03-01',
  },
];

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/api/bookings`;

  constructor(private http: HttpClient) {}

  getBookings(): Observable<Booking[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(
      map((response) => this.normalizeBookingsResponse(response)),
      map((bookings) => (bookings.length > 0 ? bookings : BOOKING_FALLBACK_MOCK))
    );
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<unknown>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (this.isRecord(response) && this.isRecord(response['data'])) {
          return this.normalizeBooking(response['data'] as Partial<Booking>, 0);
        }
        return this.normalizeBooking(this.toApiBooking(response), 0);
      })
    );
  }

  updateBooking(id: string, payload: Partial<Booking>): Observable<Booking> {
    return this.http.patch<{ success: boolean; data: Booking }>(`${this.apiUrl}/${id}`, payload).pipe(
      map((response) => response.data)
    );
  }

  deleteBooking(id: string): Observable<Booking> {
    return this.http.delete<{ success: boolean; data: Booking }>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.data)
    );
  }

  createBooking(payload: CreateBookingPayload): Observable<Booking> {
    return this.http.post<unknown>(this.apiUrl, payload).pipe(
      map((response) => {
        if (this.isRecord(response) && this.isRecord(response['data'])) {
          return this.normalizeBooking(response['data'] as Partial<Booking>, 0);
        }
        return this.normalizeBooking(this.toApiBooking(response), 0);
      })
    );
  }

  saveBookingDraft(payload: CreateBookingDraftPayload): Observable<BookingDraft> {
    return this.http.post<{ success: boolean; data: BookingDraft }>(`${this.apiUrl}/drafts`, payload).pipe(
      map((response) => response.data)
    );
  }

  getLatestBookingDraft(): Observable<BookingDraft | null> {
    return this.http.get<{ success: boolean; data: BookingDraft | null }>(`${this.apiUrl}/drafts/latest`).pipe(
      map((response) => response.data)
    );
  }

  deleteBookingDraft(id: string): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/drafts/${id}`).pipe(
      map((response) => response.success)
    );
  }

  filterBookings(params: BookingFilterParams): Observable<Booking[]> {
    return this.getBookings().pipe(
      map((bookings) =>
        bookings.filter((booking) => {
          const search = (params.search || '').trim().toLowerCase();
          if (search) {
            const roomId = booking.rooms?.[0]?.room_id || '';
            const haystack = `${booking._id} ${booking.customer_id} ${booking.guest_name || ''} ${booking.guest_phone || ''} ${roomId}`.toLowerCase();
            if (!haystack.includes(search)) {
              return false;
            }
          }

          if (params.status && params.status !== 'All') {
            const mappedStatus = this.mapStatus(booking.status);
            if (mappedStatus !== params.status) {
              return false;
            }
          }

          const roomLabel = booking.room_type || this.mapRoomLabel(booking.rooms?.[0]?.room_id || '');
          if (params.roomCategory && params.roomCategory !== 'All' && roomLabel !== params.roomCategory) {
            return false;
          }

          const checkInDate = new Date(booking.check_in).getTime();
          if (params.dateFrom && checkInDate < new Date(params.dateFrom).getTime()) {
            return false;
          }

          if (params.dateTo && checkInDate > new Date(params.dateTo).getTime()) {
            return false;
          }

          return true;
        })
      )
    );
  }

  private mapStatus(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      case 'checked_in':
        return 'Checked In';
      case 'checked_out':
        return 'Checked Out';
      default:
        return 'Pending';
    }
  }

  private mapRoomLabel(roomId: string): string {
    if (roomId.startsWith('R-')) {
      return 'Ocean Suite';
    }
    if (roomId.startsWith('V-')) {
      return 'Garden Villa';
    }
    if (roomId.startsWith('PH-')) {
      return 'Lagoon Penthouse';
    }
    return 'Deluxe Room';
  }

  private normalizeBookingsResponse(response: unknown): Booking[] {
    if (Array.isArray(response)) {
      return response.map((item, index) => this.normalizeBooking(this.toApiBooking(item), index));
    }

    if (this.isRecord(response)) {
      const payload = response['data'];
      if (Array.isArray(payload)) {
        return payload.map((item, index) => this.normalizeBooking(this.toApiBooking(item), index));
      }
    }

    return [];
  }

  private normalizeBooking(raw: Partial<Booking>, index: number): Booking {
    const fallbackId = `AZ-MOCK-${`${index + 1}`.padStart(4, '0')}`;
    const id = this.toText(raw._id, fallbackId);
    const customerId = this.toText(raw.customer_id, `CUST-${`${index + 1}`.padStart(4, '0')}`);
    const checkIn = this.toIsoDate(raw.check_in);
    const checkOut = this.toIsoDate(raw.check_out || raw.check_in);
    const guests = this.toPositiveInt(raw.guests, 2);
    const totalPrice = this.toAmount(raw.totalPrice, 0);
    const depositAmount = this.toAmount(raw.depositAmount, 0);
    const extraCharge = this.toAmount(raw.extraCharge, 0);
    const createdAt = this.toIsoDate(raw.createdAt || raw.check_in);

    const rooms = Array.isArray(raw.rooms) && raw.rooms.length > 0
      ? raw.rooms.map((room) => ({
          room_id: this.toText(room.room_id, id),
          price_per_night: this.toAmount(room.price_per_night, 0),
        }))
      : [
          {
            room_id: this.toText(raw.room_number, 'R-000'),
            price_per_night: guests > 0 ? Math.max(0, Math.round(totalPrice / guests)) : 0,
          },
        ];

    return {
      _id: id,
      customer_id: customerId,
      guest_name: this.toText(raw.guest_name, ''),
      guest_phone: this.toText(raw.guest_phone, ''),
      room_type: this.toText(raw.room_type, this.mapRoomLabel(rooms[0]?.room_id || '')),
      room_number: this.toText(raw.room_number, rooms[0]?.room_id || '-'),
      rooms,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      totalPrice,
      depositAmount,
      extraCharge,
      status: this.toText(raw.status, 'pending'),
      note: this.toText(raw.note, ''),
      createdAt,
    };
  }

  private toApiBooking(value: unknown): Partial<Booking> {
    if (!this.isRecord(value)) {
      return {};
    }
    return value as Partial<Booking>;
  }

  private toText(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
  }

  private toPositiveInt(value: unknown, fallback: number): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed);
    }
    return fallback;
  }

  private toAmount(value: unknown, fallback: number): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private toIsoDate(value: unknown): string {
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    }
    return new Date().toISOString().slice(0, 10);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
