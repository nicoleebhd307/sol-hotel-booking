import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, finalize, timeout } from 'rxjs';
import { DashboardCardComponent } from '../../components/dashboard-card/dashboard-card.component';
import { HeaderTopbarComponent } from '../../components/header-topbar/header-topbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ReportsData, ReportsResponse } from '../../models/report.model';
import { AuthService } from '../../services/auth.service';
import { ReportsService } from '../../services/reports.service';

interface ReportsKpiCard {
  label: string;
  value: number | string;
  percentage: number;
  trend: 'up' | 'down';
  icon: string;
}

interface RevenueBarPoint {
  x: number;
  y: number;
  width: number;
  height: number;
  revenue: number;
  color: string;
  label: string;
  showLabel: boolean;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    SidebarComponent,
    HeaderTopbarComponent,
    DashboardCardComponent,
  ],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit, OnDestroy {
  readonly revenueChartWidth = 640;
  readonly revenueChartHeight = 210;
  readonly revenueChartPlotHeight = 155;

  loading = false;
  errorMessage = '';
  reportsData: ReportsData | null = null;
  private requestSub: Subscription | null = null;

  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  readonly years: number[];
  selectedMonth: number;
  selectedYear: number;

  userInfo = {
    name: 'Hotel Staff',
    role: 'staff',
    profileImage: 'assets/images/admin-profile.png',
  };

  constructor(
    private reportsService: ReportsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);
  }

  get isManager(): boolean {
    return this.userInfo.role === 'manager';
  }

  ngOnInit(): void {
    const current = this.authService.getCurrentUser();
    if (current) {
      this.userInfo = {
        name: current.name,
        role: current.role,
        profileImage: current.profileImage || 'assets/images/admin-profile.png',
      };
    }

    if (this.isManager) {
      this.loadReports();
    }
  }

  ngOnDestroy(): void {
    if (this.requestSub) {
      this.requestSub.unsubscribe();
      this.requestSub = null;
    }
  }

  get kpiCards(): ReportsKpiCard[] {
    const emptyTrend = { percentage: 0, trend: 'up' as const };
    const kpis = this.reportsData?.kpis ?? {
      totalRevenue: 0,
      totalBookings: 0,
      totalCancelledBookings: 0,
      averageBookingValue: 0,
    };

    const trends = this.reportsData?.trends ?? {
      totalRevenue: emptyTrend,
      totalBookings: emptyTrend,
      totalCancelledBookings: emptyTrend,
      averageBookingValue: emptyTrend,
    };

    return [
      {
        label: 'Total Revenue',
        value: `$${kpis.totalRevenue.toLocaleString()}`,
        percentage: trends.totalRevenue.percentage,
        trend: trends.totalRevenue.trend,
        icon: 'payments',
      },
      {
        label: 'Total Bookings',
        value: kpis.totalBookings.toLocaleString(),
        percentage: trends.totalBookings.percentage,
        trend: trends.totalBookings.trend,
        icon: 'event_note',
      },
      {
        label: 'Total Cancelled',
        value: kpis.totalCancelledBookings.toLocaleString(),
        percentage: trends.totalCancelledBookings.percentage,
        trend: trends.totalCancelledBookings.trend,
        icon: 'cancel',
      },
      {
        label: 'Average Booking Value',
        value: `$${Math.round(kpis.averageBookingValue).toLocaleString()}`,
        percentage: trends.averageBookingValue.percentage,
        trend: trends.averageBookingValue.trend,
        icon: 'query_stats',
      },
    ];
  }

  get revenueBars(): RevenueBarPoint[] {
    const points = this.reportsData?.revenueByDay ?? [];
    if (!points.length) {
      return [];
    }

    const width = this.revenueChartWidth;
    const chartHeight = this.revenueChartPlotHeight;
    const maxRevenue = Math.max(...points.map((point) => point.revenue), 1);
    const total = points.length;
    const barWidth = Math.max(10, Math.floor((width - (total - 1) * 3) / total));
    const step = barWidth + 3;
    const labelInterval = Math.max(1, Math.ceil(total / 6));
    const sortedRevenues = [...points.map((point) => point.revenue)].sort((a, b) => b - a);
    const highlightThreshold = sortedRevenues[Math.min(2, sortedRevenues.length - 1)] ?? 0;

    return points.map((point, index) => {
      const height = Math.max(2, Math.round((point.revenue / maxRevenue) * chartHeight));
      const x = index * step;
      const y = chartHeight - height;
      const showLabel = index % labelInterval === 0 || index === total - 1;
      const isPeak = point.revenue >= highlightThreshold && point.revenue > 0;

      return {
        x,
        y,
        width: barWidth,
        height,
        revenue: point.revenue,
        color: isPeak ? '#2b2f88' : '#c6d8e7',
        label: this.formatDayLabel(point.day),
        showLabel,
      };
    });
  }

  get revenueGuideLines(): number[] {
    return [0, 25, 50, 75, 100].map((percent) => (this.revenueChartPlotHeight * percent) / 100);
  }

  get totalStatusCount(): number {
    const status = this.reportsData?.statusDistribution;
    if (!status) {
      return 0;
    }

    return status.pending + status.confirmed + status.cancelled;
  }

  get statusLegend(): Array<{ key: 'confirmed' | 'pending' | 'cancelled'; label: string; count: number; ratio: number; color: string }> {
    const status = this.reportsData?.statusDistribution ?? { pending: 0, confirmed: 0, cancelled: 0 };
    const total = this.totalStatusCount || 1;

    return [
      {
        key: 'confirmed',
        label: 'Confirmed',
        count: status.confirmed,
        ratio: Math.round((status.confirmed / total) * 100),
        color: '#2b2f88',
      },
      {
        key: 'pending',
        label: 'Pending',
        count: status.pending,
        ratio: Math.round((status.pending / total) * 100),
        color: '#a7e08f',
      },
      {
        key: 'cancelled',
        label: 'Cancelled',
        count: status.cancelled,
        ratio: Math.round((status.cancelled / total) * 100),
        color: '#f1d8d2',
      },
    ];
  }

  get donutSegments(): Array<{ color: string; dash: string; offset: number }> {
    const total = this.totalStatusCount;
    if (!total) {
      return [];
    }

    const radius = 74;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return this.statusLegend.map((item) => {
      const value = this.reportsData?.statusDistribution[item.key] ?? 0;
      const length = (value / total) * circumference;
      const segment = {
        color: item.color,
        dash: `${length} ${circumference - length}`,
        offset,
      };
      offset -= length;
      return segment;
    });
  }

  onMonthChange(month: number): void {
    const nextMonth = Number(month);
    if (!Number.isFinite(nextMonth) || nextMonth === this.selectedMonth) {
      return;
    }

    this.selectedMonth = nextMonth;
    this.loadReports();
  }

  onYearChange(year: number): void {
    const nextYear = Number(year);
    if (!Number.isFinite(nextYear) || nextYear === this.selectedYear) {
      return;
    }

    this.selectedYear = nextYear;
    this.loadReports();
  }

  // Backward-compatible handler for stale templates/chunks still wired to old button click.
  onApplyFilters(): void {
    this.loadReports();
  }

  getStatusClass(status: string): string {
    if (status === 'confirmed') {
      return 'bg-[#e9f7ec] text-[#246a38]';
    }
    if (status === 'pending') {
      return 'bg-[#e9f0f7] text-[#3b5a7a]';
    }
    return 'bg-[#f8ecec] text-[#a84545]';
  }

  formatStatus(status: string): string {
    if (!status) {
      return '-';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }

  private formatDayLabel(day: number): string {
    const date = new Date(Date.UTC(this.selectedYear, this.selectedMonth - 1, day));
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${String(day).padStart(2, '0')}`;
  }

  private loadReports(): void {
    if (this.requestSub) {
      this.requestSub.unsubscribe();
      this.requestSub = null;
    }

    this.loading = true;
    this.errorMessage = '';

    this.requestSub = this.reportsService
      .getReports(this.selectedMonth, this.selectedYear)
      .pipe(
        timeout(12000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: ReportsResponse) => {
          this.reportsData = response.data;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to load reports data.';
          this.cdr.detectChanges();
        },
      });
  }
}
