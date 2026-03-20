export interface ReportTrend {
  percentage: number;
  trend: 'up' | 'down';
}

export interface ReportKpis {
  totalRevenue: number;
  totalBookings: number;
  totalCancelledBookings: number;
  averageBookingValue: number;
}

export interface RevenueByDayPoint {
  day: number;
  revenue: number;
}

export interface BookingStatusDistribution {
  pending: number;
  confirmed: number;
  cancelled: number;
}

export interface RecentReportBooking {
  bookingId: string;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface ReportsData {
  month: number;
  year: number;
  kpis: ReportKpis;
  trends: {
    totalRevenue: ReportTrend;
    totalBookings: ReportTrend;
    totalCancelledBookings: ReportTrend;
    averageBookingValue: ReportTrend;
  };
  revenueByDay: RevenueByDayPoint[];
  statusDistribution: BookingStatusDistribution;
  recentBookings: RecentReportBooking[];
}

export interface ReportsResponse {
  success: boolean;
  data: ReportsData;
}
