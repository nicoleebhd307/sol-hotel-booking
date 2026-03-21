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
  readonly activityLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  readonly bookingActivity = {
    weekly: [42, 48, 45, 61, 70, 55, 73],
    monthly: [38, 44, 52, 59, 66, 62, 78],
  };

  managerStats: ManagerStatsCard[] = [];
  checkInGuests: CheckInGuest[] = [];
  checkOutGuests: CheckOutGuest[] = [];
  activityPeriod: 'weekly' | 'monthly' = 'weekly';

  isLoadingSummary = true;
  isLoadingCheckIns = true;
  isLoadingCheckOuts = true;

  summaryError = '';

  userInfo = {
    name: 'John Manager',
    role: 'manager',
    profileImage: 'assets/images/admin-profile.png',
  };

  private destroy$ = new Subject<void>();
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
      return;
    }

    this.isLoadingSummary = false;
    this.isLoadingCheckIns = false;
    this.isLoadingCheckOuts = false;
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

  private loadCheckIns(): void {
    this.isLoadingCheckIns = true;

    this.dashboardService
      .getCheckIns()
      .pipe(takeUntil(this.destroy$), timeout(8000))
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.checkInGuests = response.data;
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

  private loadCheckOuts(): void {
    this.isLoadingCheckOuts = true;

    this.dashboardService
      .getCheckOuts()
      .pipe(takeUntil(this.destroy$), timeout(8000))
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.checkOutGuests = response.data;
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

    const bottomY = 146;
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
    const height = 130;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(1, max - min);

    return values.map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 16) - 8;
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
