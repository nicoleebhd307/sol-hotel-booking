export type AdminBookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type RefundStatus = 'none' | 'pending' | 'awaiting_refund' | 'confirmed' | 'rejected';

export interface ExtraService {
  name: string;
  amount: number;
  createdAt: string;
}

export interface AdminBooking {
  bookingId: string;
  customerName: string;
  phone: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: AdminBookingStatus;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
  extraServices: ExtraService[];
  cancellation: {
    requested: boolean;
    reason: string;
    requestedAt: string;
    approvedAt: string;
  };
  refund: {
    status: RefundStatus;
    amount: number;
    processedAt: string;
    note: string;
  };
}

export interface AdminBookingListResponse {
  success: boolean;
  data: AdminBooking[];
  summary: {
    totalBookings: number;
    totalRevenue: number;
    totalDeposits: number;
  };
}

export interface RefundRequest {
  id: string;
  bookingId: string;
  customerName: string;
  phone: string;
  depositAmount: number;
  status: 'pending' | 'awaiting_refund' | 'confirmed' | 'rejected';
  createdAt: string;
  processedAt?: string;
  note?: string;
}
