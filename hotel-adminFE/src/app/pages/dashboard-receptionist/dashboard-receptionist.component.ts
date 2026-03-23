import { ChangeDetectorRef, Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderTopbarComponent } from '../../components/header-topbar/header-topbar.component';
import { DashboardCardComponent } from '../../components/dashboard-card/dashboard-card.component';
import { QuickActionCardComponent } from '../../components/quick-action-card/quick-action-card.component';
import { TableCheckinsComponent } from '../../components/table-checkins/table-checkins.component';
import { TableCheckoutsComponent } from '../../components/table-checkouts/table-checkouts.component';
import { DashboardService, CheckInGuest, CheckOutGuest } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { Subject, timeout } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DashboardStats {
  label: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down';
  icon: string;
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

  // Loading states
  isLoadingSummary = true;
  isLoadingCheckIns = true;
  isLoadingCheckOuts = true;
  isLoadingRooms = true;

  // Status update tracking
  updatingCheckInId: string | null = null;
  updatingCheckOutId: string | null = null;
  
  // Error messages
  summaryError = '';
  checkInsError = '';
  checkOutsError = '';
  roomsError = '';
  
  // User info
  userInfo = {
    name: 'Hotel Staff',
    role: 'receptionist',
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
      role: user?.role ?? localUser?.role ?? 'receptionist',
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

  /**
   * Load all dashboard data from API
   */
  loadDashboardData(): void {
    this.loadSummary();
    this.loadCheckIns();
    this.loadCheckOuts();
    this.loadRoomAvailability();
  }

  /**
   * Load dashboard summary statistics
   */
  private loadSummary(): void {
    this.isLoadingSummary = true;
    this.summaryError = '';
    
    this.dashboardService.getSummary()
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
                value: data.totalBookingsToday,
                percentage: data.bookingStats.percentage,
                trend: data.bookingStats.trend as 'up' | 'down',
                icon: 'event'
              },
              {
                label: 'Check-in',
                value: data.checkIn,
                percentage: data.checkInStats.percentage,
                trend: data.checkInStats.trend as 'up' | 'down',
                icon: 'login'
              },
              {
                label: 'Check-out',
                value: data.checkOut,
                percentage: data.checkOutStats.percentage,
                trend: data.checkOutStats.trend as 'up' | 'down',
                icon: 'logout'
              },
              {
                label: 'Available Rooms',
                value: data.availableRooms,
                percentage: Math.abs(data.availableRoomsStats.percentage),
                trend: data.availableRoomsStats.trend as 'up' | 'down',
                icon: 'hotel'
              }
            ];
          }
          this.isLoadingSummary = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading dashboard summary:', error);
          this.summaryError = 'Failed to load dashboard summary. Using default data.';
          this.setDefaultSummary();
          this.isLoadingSummary = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Load check-in guests
   */
  loadCheckIns(): void {
    this.isLoadingCheckIns = true;
    this.checkInsError = '';
    
    this.dashboardService.getCheckIns()
      .pipe(
        takeUntil(this.destroy$),
        timeout(8000)
      )
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.checkInGuests = response.data;
            this.checkInPage = 0;
          }
          this.isLoadingCheckIns = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading check-ins:', error);
          this.checkInsError = 'Failed to load check-in data. Using default data.';
          this.setDefaultCheckIns();
          this.isLoadingCheckIns = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Load check-out guests
   */
  loadCheckOuts(): void {
    this.isLoadingCheckOuts = true;
    this.checkOutsError = '';
    
    this.dashboardService.getCheckOuts()
      .pipe(
        takeUntil(this.destroy$),
        timeout(8000)
      )
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.checkOutGuests = response.data;
            this.checkOutPage = 0;
          }
          this.isLoadingCheckOuts = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading check-outs:', error);
          this.checkOutsError = 'Failed to load check-out data. Using default data.';
          this.setDefaultCheckOuts();
          this.isLoadingCheckOuts = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Load room availability
   */
  private loadRoomAvailability(): void {
    this.isLoadingRooms = true;
    this.roomsError = '';
    
    this.dashboardService.getRoomAvailability()
      .pipe(
        takeUntil(this.destroy$),
        timeout(8000)
      )
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.roomAvailability = response.data;
          }
          this.isLoadingRooms = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading room availability:', error);
          this.roomsError = 'Failed to load room data. Using default data.';
          this.setDefaultRooms();
          this.isLoadingRooms = false;
          this.cdr.detectChanges();
        }
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
    this.checkInGuests = [];
  }

  /**
   * Set default check-out data (fallback)
   */
  private setDefaultCheckOuts(): void {
    this.checkOutGuests = [];
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
