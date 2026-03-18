export type BookingRole = 'receptionist' | 'manager';

export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';
export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed' | 'Checked In' | 'Checked Out';

export interface Booking {
  _id: string;
  customer_id: string;
  guest_name?: string;
  guest_phone?: string;
  room_type?: string;
  room_number?: string;
  rooms: {
    room_id: string;
    price_per_night: number;
  }[];
  check_in: string;
  check_out: string;
  guests: number;
  totalPrice: number;
  depositAmount: number;
  extraCharge: number;
  status: string;
  note: string;
  createdAt: string;
}

export interface BookingView {
  id: string;
  guestName: string;
  phone: string;
  roomType: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
}

export interface BookingFilterParams {
  search?: string;
  status?: BookingStatus | 'All';
  dateRange?: string;
  dateFrom?: string;
  dateTo?: string;
  roomCategory?: string;
}
