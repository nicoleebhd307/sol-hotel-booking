import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Subject, forkJoin, timeout } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardCardComponent } from '../../components/dashboard-card/dashboard-card.component';
import { HeaderTopbarComponent } from '../../components/header-topbar/header-topbar.component';
import { QuickActionCardComponent } from '../../components/quick-action-card/quick-action-card.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TableCheckinsComponent } from '../../components/table-checkins/table-checkins.component';
import { TableCheckoutsComponent } from '../../components/table-checkouts/table-checkouts.component';
import { DashboardService, CheckInGuest, CheckOutGuest } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';

interface ManagerStatsCard {
  label: string;
  value: number | string;
  percentage: number;
  trend: 'up' | 'down';
  icon: string;
}

@Component({
  selector: 'app-dashboard-manager',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderTopbarComponent,
    DashboardCardComponent,
    QuickActionCardComponent,
    TableCheckinsComponent,
    TableCheckoutsComponent,
  ],
  templateUrl: './dashboard-manager.component.html',
  styleUrl: './dashboard-manager.component.css',
})
export class DashboardManagerComponent implements OnInit, OnDestroy {
  readonly activityLabelsByPeriod = {
    weekly: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    monthly: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  };
  readonly bookingActivity = {
    weekly: [42, 48, 45, 61, 70, 55, 73],
    monthly: [420, 438, 462, 479, 495, 512, 526, 518, 534, 556, 572, 590],
  };

  managerStats: ManagerStatsCard[] = [];
  checkInGuests: CheckInGuest[] = [];
  checkOutGuests: CheckOutGuest[] = [];
  activityPeriod: 'weekly' | 'monthly' = 'weekly';

  // Pagination
  readonly pageSize = 5;
  checkInPage = 0;
  checkOutPage = 0;

  get pagedCheckIns(): CheckInGuest[] {
    return this.checkInGuests.slice(this.checkInPage * this.pageSize, (this.checkInPage + 1) * this.pageSize);
  }

  get checkInTotalPages(): number {
    return Math.max(1, Math.ceil(this.checkInGuests.length / this.pageSize));
  }

  get pagedCheckOuts(): CheckOutGuest[] {
    return this.checkOutGuests.slice(this.checkOutPage * this.pageSize, (this.checkOutPage + 1) * this.pageSize);
  }

  get checkOutTotalPages(): number {
    return Math.max(1, Math.ceil(this.checkOutGuests.length / this.pageSize));
  }

  prevCheckInPage(): void { if (this.checkInPage > 0) this.checkInPage--; }
  nextCheckInPage(): void { if (this.checkInPage < this.checkInTotalPages - 1) this.checkInPage++; }
  prevCheckOutPage(): void { if (this.checkOutPage > 0) this.checkOutPage--; }
  nextCheckOutPage(): void { if (this.checkOutPage < this.checkOutTotalPages - 1) this.checkOutPage++; }

  isLoadingSummary = true;
  isLoadingCheckIns = true;
  isLoadingCheckOuts = true;

  // Status update tracking
  updatingCheckInId: string | null = null;
  updatingCheckOutId: string | null = null;

  summaryError = '';

  userInfo = {
    name: 'Hotel Staff',
    role: 'manager',
    profileImage: 'assets/images/admin-profile.png',
  };

  private destroy$ = new Subject<void>();
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.resolveUserInfo();
    this.loadDashboardData();
  }

  private resolveUserInfo(): void {
    const user = this.authService.getCurrentUser();
    const isBrowser = isPlatformBrowser(this.platformId);
    const local = isBrowser ? localStorage.getItem('authUser') : null;
    const localUser = local ? JSON.parse(local) : null;

    this.userInfo = {
      name: user?.name ?? localUser?.name ?? 'Hotel Staff',
      role: user?.role ?? localUser?.role ?? 'manager',
      profileImage: user?.profileImage ?? localUser?.profileImage ?? 'assets/images/admin-profile.png',
    };
  }

  onCheckIn(guest: CheckInGuest): void {
    this.updatingCheckInId = guest.bookingId;
    this.bookingService.updateBooking(guest.bookingId, { status: 'checked_in' } as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.updatingCheckInId = null; this.loadCheckIns(); },
        error: () => { this.updatingCheckInId = null; }
      });
  }

  onCheckOut(guest: CheckOutGuest): void {
    this.updatingCheckOutId = guest.bookingId;
    this.bookingService.updateBooking(guest.bookingId, { status: 'checked_out' } as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.updatingCheckOutId = null; this.loadCheckOuts(); },
        error: () => { this.updatingCheckOutId = null; }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loadSummary();
    this.loadCheckIns();
    this.loadCheckOuts();
  }

  private loadSummary(): void {
    this.isLoadingSummary = true;
    this.summaryError = '';

    forkJoin({
      managerSummary: this.dashboardService.getManagerSummary(),
      operationsSummary: this.dashboardService.getSummary(),
    })
      .pipe(takeUntil(this.destroy$), timeout(8000))
      .subscribe({
        next: (response) => {
          const managerData = response.managerSummary?.data;
          const operationData = response.operationsSummary?.data;

          if (response.managerSummary?.success && response.operationsSummary?.success && managerData && operationData) {
            this.managerStats = [
              {
                label: 'Total Bookings Today',
                value: operationData.totalBookingsToday,
                percentage: operationData.bookingStats.percentage,
                trend: operationData.bookingStats.trend as 'up' | 'down',
                icon: 'calendar_month',
              },
              {
                label: 'Occupancy Rate',
                value: `${managerData.occupancyRate}%`,
                percentage: managerData.occupancyStats.percentage,
                trend: managerData.occupancyStats.trend as 'up' | 'down',
                icon: 'apartment',
              },
              {
                label: 'Total Revenue',
                value: `$${managerData.revenueToday.toLocaleString()}`,
                percentage: managerData.revenueStats.percentage,
                trend: managerData.revenueStats.trend as 'up' | 'down',
                icon: 'payments',
              },
              {
                label: 'Available Rooms',
                value: operationData.availableRooms,
                percentage: Math.abs(operationData.availableRoomsStats.percentage),
                trend: operationData.availableRoomsStats.trend as 'up' | 'down',
                icon: 'bed',
              },
            ];
          }

          this.isLoadingSummary = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.summaryError = 'Failed to load manager summary. Using default data.';
          this.setDefaultSummary();
          this.isLoadingSummary = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadCheckIns(): void {
    this.isLoadingCheckIns = true;

    this.dashboardService
      .getCheckIns()
      .pipe(takeUntil(this.destroy$), timeout(8000))
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.checkInGuests = response.data;
            this.checkInPage = 0;
          }
          this.isLoadingCheckIns = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingCheckIns = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadCheckOuts(): void {
    this.isLoadingCheckOuts = true;

    this.dashboardService
      .getCheckOuts()
      .pipe(takeUntil(this.destroy$), timeout(8000))
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.checkOutGuests = response.data;
            this.checkOutPage = 0;
          }
          this.isLoadingCheckOuts = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingCheckOuts = false;
          this.cdr.detectChanges();
        },
      });
  }

  setActivityPeriod(period: 'weekly' | 'monthly'): void {
    this.activityPeriod = period;
  }

  get activityLabels(): string[] {
    return this.activityLabelsByPeriod[this.activityPeriod];
  }

  get activitySubtitle(): string {
    return this.activityPeriod === 'weekly'
      ? 'Overview of guest reservations from last 7 days'
      : 'Overview of guest reservations by month in this year';
  }

  get activitySmoothPath(): string {
    const points = this.getActivityPoints();
    if (points.length === 0) {
      return '';
    }

    if (points.length < 3) {
      return points
        .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
        .join(' ');
    }

    let path = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    for (let i = 0; i < points.length - 1; i += 1) {
      const current = points[i];
      const next = points[i + 1];
      const previous = points[i - 1] ?? current;
      const afterNext = points[i + 2] ?? next;

      const cp1x = current.x + (next.x - previous.x) / 6;
      const cp1y = current.y + (next.y - previous.y) / 6;
      const cp2x = next.x - (afterNext.x - current.x) / 6;
      const cp2y = next.y - (afterNext.y - current.y) / 6;

      path += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
    }

    return path;
  }

  get activityAreaPath(): string {
    const points = this.getActivityPoints();
    if (points.length === 0) {
      return '';
    }

    const bottomY = 196;
    return `${this.activitySmoothPath} L${points[points.length - 1].x.toFixed(1)} ${bottomY} L${points[0].x.toFixed(1)} ${bottomY} Z`;
  }

  get activityDots(): Array<{ x: number; y: number }> {
    return this.getActivityPoints();
  }

  private getActivityPoints(): Array<{ x: number; y: number }> {
    const values = this.bookingActivity[this.activityPeriod];
    if (!values.length) {
      return [];
    }

    const width = 560;
    const height = 180;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(1, max - min);

    const divider = Math.max(1, values.length - 1);

    return values.map((value, index) => {
      const x = (index / divider) * width;
      const y = height - ((value - min) / range) * (height - 20) - 10;
      return { x, y };
    });
  }

  private setDefaultSummary(): void {
    this.managerStats = [
      { label: 'Total Bookings Today', value: 24, percentage: 12, trend: 'up', icon: 'calendar_month' },
      { label: 'Occupancy Rate', value: '88%', percentage: 5, trend: 'up', icon: 'apartment' },
      { label: 'Total Revenue', value: '$12,450', percentage: 22, trend: 'up', icon: 'payments' },
      { label: 'Available Rooms', value: 12, percentage: 2, trend: 'down', icon: 'bed' },
    ];
  }
}
