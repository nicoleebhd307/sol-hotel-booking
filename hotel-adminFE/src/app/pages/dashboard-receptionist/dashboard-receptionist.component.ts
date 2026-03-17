import { ChangeDetectorRef, Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderTopbarComponent } from '../../components/header-topbar/header-topbar.component';
import { DashboardCardComponent } from '../../components/dashboard-card/dashboard-card.component';
import { QuickActionCardComponent } from '../../components/quick-action-card/quick-action-card.component';
import { TableCheckinsComponent } from '../../components/table-checkins/table-checkins.component';
import { TableCheckoutsComponent } from '../../components/table-checkouts/table-checkouts.component';
import { DashboardService } from '../../services/dashboard.service';
import { Subject, timeout } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DashboardStats {
  label: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down';
  icon: string;
}

interface CheckInGuest {
  id: number;
  guestName: string;
  room: string;
  time: string;
  roomType: string;
}

interface CheckOutGuest {
  id: number;
  guestName: string;
  room: string;
  status: string;
  amount: number;
  checkoutTime: string;
}

interface RoomAvailability {
  roomType: string;
  available: number;
  total: number;
  percentage: number;
}

@Component({
  selector: 'app-dashboard-receptionist',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderTopbarComponent,
    DashboardCardComponent,
    QuickActionCardComponent,
    TableCheckinsComponent,
    TableCheckoutsComponent
  ],
  templateUrl: './dashboard-receptionist.component.html',
  styleUrl: './dashboard-receptionist.component.css'
})
export class DashboardReceptionistComponent implements OnInit, OnDestroy {
  // Dashboard stats
  dashboardStats: DashboardStats[] = [];
  
  // Guest data
  checkInGuests: CheckInGuest[] = [];
  checkOutGuests: CheckOutGuest[] = [];
  
  // Room availability
  roomAvailability: RoomAvailability[] = [];
  
  // Loading states
  isLoadingSummary = true;
  isLoadingCheckIns = true;
  isLoadingCheckOuts = true;
  isLoadingRooms = true;
  
  // Error messages
  summaryError = '';
  checkInsError = '';
  checkOutsError = '';
  roomsError = '';
  
  // User info
  userInfo = {
    name: 'Mary Janes',
    role: 'receptionist',
    profileImage: 'assets/images/admin-profile.png'
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

    // Avoid locking SSR HTML in a loading state before hydration on the client.
    this.isLoadingSummary = false;
    this.isLoadingCheckIns = false;
    this.isLoadingCheckOuts = false;
    this.isLoadingRooms = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data from API
   */
  loadDashboardData(): void {
    this.isLoadingSummary = true;
    this.isLoadingCheckIns = true;
    this.isLoadingCheckOuts = true;
    this.isLoadingRooms = true;

    this.summaryError = '';
    this.checkInsError = '';
    this.checkOutsError = '';
    this.roomsError = '';

    this.dashboardService
      .getReceptionistDashboard()
      .pipe(
        takeUntil(this.destroy$),
        timeout(8000)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const data = response.data;
            this.dashboardStats = [
              {
                label: 'Total Bookings Today',
                value: data.summary.totalBookingsToday,
                percentage: data.summary.bookingStats.percentage,
                trend: data.summary.bookingStats.trend as 'up' | 'down',
                icon: 'event',
              },
              {
                label: 'Check-in',
                value: data.summary.checkIn,
                percentage: data.summary.checkInStats.percentage,
                trend: data.summary.checkInStats.trend as 'up' | 'down',
                icon: 'login',
              },
              {
                label: 'Check-out',
                value: data.summary.checkOut,
                percentage: data.summary.checkOutStats.percentage,
                trend: data.summary.checkOutStats.trend as 'up' | 'down',
                icon: 'logout',
              },
              {
                label: 'Available Rooms',
                value: data.summary.availableRooms,
                percentage: Math.abs(data.summary.availableRoomsStats.percentage),
                trend: data.summary.availableRoomsStats.trend as 'up' | 'down',
                icon: 'hotel',
              },
            ];

            this.roomAvailability = data.roomAvailability;
            this.checkInGuests = data.checkIns;
            this.checkOutGuests = data.checkOuts;
          }

          this.isLoadingSummary = false;
          this.isLoadingCheckIns = false;
          this.isLoadingCheckOuts = false;
          this.isLoadingRooms = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading receptionist dashboard:', error);
          this.summaryError = 'Failed to load dashboard summary. Using default data.';
          this.checkInsError = 'Failed to load check-in data. Using default data.';
          this.checkOutsError = 'Failed to load check-out data. Using default data.';
          this.roomsError = 'Failed to load room data. Using default data.';

          this.setDefaultSummary();
          this.setDefaultCheckIns();
          this.setDefaultCheckOuts();
          this.setDefaultRooms();

          this.isLoadingSummary = false;
          this.isLoadingCheckIns = false;
          this.isLoadingCheckOuts = false;
          this.isLoadingRooms = false;
          this.cdr.detectChanges();
        },
      });
  }

  /**
   * Set default summary data (fallback)
   */
  private setDefaultSummary(): void {
    this.dashboardStats = [
      { label: 'Total Bookings Today', value: 24, percentage: 12, trend: 'up', icon: 'event' },
      { label: 'Check-in', value: 26, percentage: 5, trend: 'up', icon: 'login' },
      { label: 'Check-out', value: 12, percentage: 22, trend: 'up', icon: 'logout' },
      { label: 'Available Rooms', value: 12, percentage: 2, trend: 'down', icon: 'hotel' }
    ];
  }

  /**
   * Set default check-in data (fallback)
   */
  private setDefaultCheckIns(): void {
    this.checkInGuests = [
      { id: 1, guestName: 'Julianne Moore', room: 'Suite 402', time: '14:30 PM', roomType: 'Suite' },
      { id: 2, guestName: 'Victor Hugo', room: 'Ocean Villa 03', time: '15:00 PM', roomType: 'Villa' },
      { id: 3, guestName: 'Clara Oswald', room: 'Deluxe 108', time: '16:15 PM', roomType: 'Deluxe' }
    ];
  }

  /**
   * Set default check-out data (fallback)
   */
  private setDefaultCheckOuts(): void {
    this.checkOutGuests = [
      { id: 1, guestName: 'Marcus Aurelius', room: 'King Suite 12', status: 'Paid', amount: 450, checkoutTime: '10:00 AM' },
      { id: 2, guestName: 'Sophia Loren', room: 'Suite 405', status: 'Pending', amount: 320, checkoutTime: '10:30 AM' },
      { id: 3, guestName: 'James Bond', room: 'Secret Villa 07', status: 'Paid', amount: 850, checkoutTime: '11:00 AM' }
    ];
  }

  /**
   * Set default room data (fallback)
   */
  private setDefaultRooms(): void {
    this.roomAvailability = [
      { roomType: 'Luxury Suites', available: 17, total: 20, percentage: 85 },
      { roomType: 'Beachfront Villas', available: 8, total: 19, percentage: 42 },
      { roomType: 'Ocean Deluxes', available: 20, total: 30, percentage: 67 }
    ];
  }

  /**
   * Refresh dashboard data
   */
  refreshData(): void {
    this.loadDashboardData();
  }
}
