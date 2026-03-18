import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BookingFilterComponent } from '../../components/booking-filter/booking-filter.component';
import { BookingTableComponent } from '../../components/booking-table/booking-table.component';
import { HeaderTopbarComponent } from '../../components/header-topbar/header-topbar.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { Booking, BookingFilterParams, BookingRole, BookingStatus, BookingView, PaymentStatus } from '../../models/booking.model';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    SidebarComponent,
    HeaderTopbarComponent,
    BookingFilterComponent,
    BookingTableComponent,
    PaginationComponent,
  ],
  templateUrl: './bookings.component.html',
})
export class BookingsComponent implements OnInit {
  role: BookingRole = 'receptionist';
  loading = false;
  detailLoading = false;
  deleteLoading = false;
  currentPage = 1;
  pageSize = 15;

  private allBookings: BookingView[] = [];
  pagedBookings: BookingView[] = [];
  selectedBooking: Booking | null = null;
  selectedBookingView: BookingView | null = null;
  pendingDeleteBooking: BookingView | null = null;

  userInfo = {
    name: 'Hotel Staff',
    role: 'receptionist',
    profileImage: 'assets/images/admin-profile.png',
  };

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.resolveUserRole();
    this.loadBookings();
  }

  get totalBookings(): number {
    return this.allBookings.length;
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.updateBookingsView(bookings);
      },
      error: () => {
        this.updateBookingsView([]);
      },
    });
  }

  onFilterChange(filters: BookingFilterParams): void {
    this.loading = true;
    this.bookingService.filterBookings(filters).subscribe({
      next: (bookings) => {
        this.updateBookingsView(bookings);
      },
      error: () => {
        this.updateBookingsView([]);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyPagination();
  }

  onNewBooking(): void {
    console.log('Create new booking action clicked.');
  }

  onViewBooking(booking: BookingView): void {
    this.detailLoading = true;
    this.selectedBooking = null;

    this.bookingService.getBookingById(booking.id).subscribe({
      next: (detail) => {
        this.ngZone.run(() => {
          this.selectedBooking = detail;
          this.selectedBookingView = this.mapToViewBooking(detail);
          this.detailLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.detailLoading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  onCheckInBooking(booking: BookingView): void {
    this.bookingService.updateBooking(booking.id, { status: 'checked_in' }).subscribe({
      next: () => {
        this.loadBookings();
        if (this.selectedBooking?._id === booking.id) {
          this.onViewBooking(booking);
        }
      },
    });
  }

  onEditBooking(booking: BookingView): void {
    this.bookingService.updateBooking(booking.id, { status: 'completed' }).subscribe({
      next: () => {
        this.loadBookings();
        if (this.selectedBooking?._id === booking.id) {
          this.onViewBooking(booking);
        }
      },
    });
  }

  onDeleteBooking(booking: BookingView): void {
    this.pendingDeleteBooking = booking;
  }

  cancelDeleteBooking(): void {
    if (this.deleteLoading) {
      return;
    }
    this.pendingDeleteBooking = null;
  }

  confirmDeleteBooking(): void {
    if (!this.pendingDeleteBooking || this.deleteLoading) {
      return;
    }

    const bookingToDelete = this.pendingDeleteBooking;
    this.deleteLoading = true;

    this.bookingService.deleteBooking(bookingToDelete.id).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.pendingDeleteBooking = null;
        this.loadBookings();

        if (this.selectedBooking?._id === bookingToDelete.id) {
          this.closeBookingDetail();
        }
      },
      error: () => {
        this.deleteLoading = false;
      },
    });
  }

  closeBookingDetail(): void {
    this.selectedBooking = null;
    this.selectedBookingView = null;
    this.detailLoading = false;
  }

  getSelectedMappedStatus(): BookingStatus | '-' {
    if (!this.selectedBooking) {
      return '-';
    }
    return this.mapStatus(this.selectedBooking.status);
  }

  getSelectedMappedPaymentStatus(): PaymentStatus | '-' {
    if (!this.selectedBooking) {
      return '-';
    }
    return this.mapPaymentStatus(this.selectedBooking.totalPrice, this.selectedBooking.depositAmount);
  }

  private resolveUserRole(): void {
    const user = this.authService.getCurrentUser();
    const isBrowser = isPlatformBrowser(this.platformId);
    const local = isBrowser ? localStorage.getItem('authUser') : null;
    const localUser = local ? JSON.parse(local) : null;
    const role = user?.role ?? localUser?.role;

    this.role = role === 'manager' ? 'manager' : 'receptionist';

    this.userInfo = {
      name: user?.name ?? localUser?.name ?? 'Hotel Staff',
      role: this.role,
      profileImage: user?.profileImage ?? localUser?.profileImage ?? 'assets/images/admin-profile.png',
    };
  }

  private applyPagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedBookings = this.allBookings.slice(start, end);
  }

  private updateBookingsView(bookings: Booking[]): void {
    this.ngZone.run(() => {
      this.allBookings = bookings.map((booking) => this.mapToViewBooking(booking));
      this.currentPage = 1;
      this.applyPagination();
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  private mapToViewBooking(booking: Booking): BookingView {
    const firstRoom = booking.rooms?.[0];
    const customerId = booking.customer_id || '';
    const guestSuffix = customerId ? customerId.slice(-4) : booking._id.slice(-4);

    return {
      id: booking._id,
      guestName: booking.guest_name || `Customer ${guestSuffix}`,
      phone: booking.guest_phone || customerId || '-',
      roomType: booking.room_type || this.mapRoomType(firstRoom?.room_id || ''),
      roomNumber: booking.room_number || firstRoom?.room_id || '-',
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      paymentStatus: this.mapPaymentStatus(booking.totalPrice, booking.depositAmount),
      status: this.mapStatus(booking.status),
    };
  }

  private mapPaymentStatus(totalPrice: number, depositAmount: number): PaymentStatus {
    if (depositAmount === 0) {
      return 'Unpaid';
    }
    if (totalPrice <= depositAmount) {
      return 'Paid';
    }
    return 'Partial';
  }

  private mapStatus(status: string): BookingStatus {
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

  private mapRoomType(roomId: string): string {
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
}
