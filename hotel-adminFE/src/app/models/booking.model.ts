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

export interface CreateBookingPayload {
  guestName: string;
  phone: string;
  email: string;
  identityNumber: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  totalPrice: number;
  pricePerNight: number;
  status: 'confirmed';
  note?: string;
}

export interface CreateBookingDraftPayload {
  draftId?: string;
  selectedRoomId: string;
  formValue: {
    phone: string;
    fullName: string;
    email: string;
    identityNumber: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
    pricePerNight: number;
    note: string;
  };
}

export interface BookingDraft {
  _id: string;
  selectedRoomId: string;
  formValue: {
    phone: string;
    fullName: string;
    email: string;
    identityNumber: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
    pricePerNight: number;
    note: string;
  };
  updatedAt: string;
}
