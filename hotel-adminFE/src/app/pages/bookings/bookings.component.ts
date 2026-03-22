import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { Subscription } from 'rxjs';
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
    FormsModule,
    MatIconModule,
    SidebarComponent,
    HeaderTopbarComponent,
    BookingFilterComponent,
    BookingTableComponent,
    PaginationComponent,
  ],
  templateUrl: './bookings.component.html',
  styles: [
    `
      .booking-modal-overlay {
        animation: bookingOverlayFadeIn 180ms ease-out;
      }

      .booking-modal-panel {
        animation: bookingPanelEnter 220ms ease-out;
      }

      @keyframes bookingOverlayFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes bookingPanelEnter {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
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
  isEditingDetail = false;
  savingEdit = false;
  editForm = {
    guestName: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: '',
    roomNumber: '',
    note: '',
  };
  pendingDeleteBooking: BookingView | null = null;
  pendingCancelStatusChange: { booking: BookingView; status: BookingStatus } | null = null;
  private statusUpdatingIds = new Set<string>();

  userInfo = {
    name: 'Hotel Staff',
    role: 'receptionist',
    profileImage: 'assets/images/admin-profile.png',
  };

  private readonly platformId = inject(PLATFORM_ID);
  private readonly appRouter = inject(Router);
  private bookingPaymentSyncSub: Subscription | null = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.resolveUserRole();
    this.listenBookingPaymentSync();
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.bookingPaymentSyncSub?.unsubscribe();
    this.bookingPaymentSyncSub = null;
  }

  get totalBookings(): number {
    return this.allBookings.length;
  }

  get statusUpdatingList(): string[] {
    return Array.from(this.statusUpdatingIds);
  }

  get selectedBookingNights(): number {
    if (!this.selectedBooking) {
      return 0;
    }

    const checkIn = new Date(this.selectedBooking.check_in).getTime();
    const checkOut = new Date(this.selectedBooking.check_out).getTime();
    const diff = Math.ceil((checkOut - checkIn) / 86400000);

    return Number.isFinite(diff) && diff > 0 ? diff : 1;
  }

  get selectedRoomPricePerNight(): number {
    if (!this.selectedBooking) {
      return 0;
    }

    return Number(this.selectedBooking.rooms?.[0]?.price_per_night || 0);
  }

  get selectedBookingSubtotal(): number {
    if (!this.selectedBooking) {
      return 0;
    }

    const subtotal = this.selectedRoomPricePerNight * this.selectedBookingNights;
    if (subtotal > 0) {
      return subtotal;
    }

    return Math.max(0, Number(this.selectedBooking.totalPrice || 0) - Number(this.selectedBooking.extraCharge || 0));
  }

  get cancelStatusChangeLoading(): boolean {
    if (!this.pendingCancelStatusChange) {
      return false;
    }
    return this.statusUpdatingIds.has(this.pendingCancelStatusChange.booking.id);
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
    if (this.appRouter) {
      this.appRouter.navigate(['/bookings/new']);
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/bookings/new';
    }
  }

  onViewBooking(booking: BookingView): void {
    this.detailLoading = true;
    this.selectedBooking = null;
    this.isEditingDetail = false;

    this.bookingService.getBookingById(booking.id).subscribe({
      next: (detail) => {
        this.ngZone.run(() => {
          this.selectedBooking = detail;
          this.selectedBookingView = this.mapToViewBooking(detail);
          this.syncEditFormFromSelectedBooking();
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
    const nextStatus = this.getReceptionistNextStatus(booking.status);
    if (!nextStatus) {
      return;
    }

    this.bookingService.updateBooking(booking.id, { status: nextStatus }).subscribe({
      next: () => {
        this.loadBookings();
        if (this.selectedBooking?._id === booking.id) {
          this.onViewBooking(booking);
        }
      },
    });
  }

  onEditBooking(booking: BookingView): void {
    const nextStatus = this.getManagerNextStatus(booking.status);
    if (!nextStatus) {
      return;
    }

    this.bookingService.updateBooking(booking.id, { status: nextStatus }).subscribe({
      next: () => {
        this.loadBookings();
        if (this.selectedBooking?._id === booking.id) {
          this.onViewBooking(booking);
        }
      },
    });
  }

  onStatusChange(event: { booking: BookingView; status: BookingStatus }): void {
    if (event.status === 'Cancelled') {
      this.pendingCancelStatusChange = event;
      return;
    }

    this.submitStatusChange(event);
  }

  cancelStatusChange(): void {
    if (this.cancelStatusChangeLoading) {
      return;
    }

    this.pendingCancelStatusChange = null;
  }

  confirmStatusChange(): void {
    if (!this.pendingCancelStatusChange || this.cancelStatusChangeLoading) {
      return;
    }

    const event = this.pendingCancelStatusChange;
    this.submitStatusChange(event, () => {
      this.pendingCancelStatusChange = null;
    });
  }

  private submitStatusChange(event: { booking: BookingView; status: BookingStatus }, onSuccess?: () => void): void {
    const bookingId = event.booking.id;
    const nextStatus = this.toApiStatus(event.status);

    if (!nextStatus || this.statusUpdatingIds.has(bookingId)) {
      return;
    }

    this.statusUpdatingIds.add(bookingId);

    this.bookingService.updateBooking(bookingId, { status: nextStatus }).subscribe({
      next: () => {
        this.statusUpdatingIds.delete(bookingId);
        if (onSuccess) {
          onSuccess();
        }
        this.loadBookings();
        if (this.selectedBooking?._id === bookingId) {
          this.onViewBooking(event.booking);
        }
      },
      error: () => {
        this.statusUpdatingIds.delete(bookingId);
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
    this.isEditingDetail = false;
    this.savingEdit = false;
    this.selectedBooking = null;
    this.selectedBookingView = null;
    this.detailLoading = false;
  }

  startEditDetail(): void {
    if (!this.selectedBooking || this.savingEdit) {
      return;
    }

    this.syncEditFormFromSelectedBooking();
    this.isEditingDetail = true;
  }

  cancelEditDetail(): void {
    if (this.savingEdit) {
      return;
    }

    this.syncEditFormFromSelectedBooking();
    this.isEditingDetail = false;
  }

  saveEditDetail(): void {
    if (!this.selectedBooking || this.savingEdit) {
      return;
    }

    const nextCheckIn = this.toDateInput(this.editForm.checkIn);
    const nextCheckOut = this.toDateInput(this.editForm.checkOut);
    if (!nextCheckIn || !nextCheckOut) {
      return;
    }

    if (new Date(nextCheckOut).getTime() < new Date(nextCheckIn).getTime()) {
      return;
    }

    this.savingEdit = true;

    const previousBooking = this.selectedBooking;

    const payload: Partial<Booking> = {
      guest_name: this.editForm.guestName.trim(),
      guest_phone: this.editForm.guestPhone.trim(),
      room_type: this.editForm.roomType.trim(),
      room_number: this.editForm.roomNumber.trim(),
      check_in: nextCheckIn,
      check_out: nextCheckOut,
      guests: Math.max(1, Number(this.editForm.guests) || 1),
      note: this.editForm.note.trim(),
    };

    const optimisticBooking: Booking = {
      ...this.selectedBooking,
      ...payload,
    };

    this.selectedBooking = optimisticBooking;
    this.selectedBookingView = this.mapToViewBooking(optimisticBooking);
    this.updateBookingListEntry(optimisticBooking);
    this.isEditingDetail = false;
    this.cdr.detectChanges();

    this.bookingService.updateBooking(this.selectedBooking._id, payload)
      .pipe(
        timeout(6000),
        finalize(() => {
          this.ngZone.run(() => {
            this.savingEdit = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (updatedBooking) => {
          this.ngZone.run(() => {
            this.selectedBooking = updatedBooking;
            this.selectedBookingView = this.mapToViewBooking(updatedBooking);
            this.updateBookingListEntry(updatedBooking);
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            if (previousBooking) {
              this.selectedBooking = previousBooking;
              this.selectedBookingView = this.mapToViewBooking(previousBooking);
              this.updateBookingListEntry(previousBooking);
            }
            this.cdr.detectChanges();
          });
        },
      });
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
    return this.mapPaymentStatus(
      this.selectedBooking.totalPrice,
      this.selectedBooking.depositAmount,
      this.selectedBooking.payment,
      this.selectedBooking.refundStatus,
    );
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
      paymentStatus: this.mapPaymentStatus(booking.totalPrice, booking.depositAmount, booking.payment, booking.refundStatus),
      status: this.mapStatus(booking.status),
    };
  }

  private listenBookingPaymentSync(): void {
    this.bookingPaymentSyncSub = this.bookingService.bookingPaymentSync$.subscribe((event) => {
      this.ngZone.run(() => {
        const index = this.allBookings.findIndex((booking) => booking.id === event.bookingId);
        if (index >= 0) {
          this.allBookings[index] = {
            ...this.allBookings[index],
            paymentStatus: 'Refunded',
          };
          this.applyPagination();
        }

        if (this.selectedBooking?._id === event.bookingId) {
          this.selectedBooking = {
            ...this.selectedBooking,
            payment: 'Refunded',
          };

          this.selectedBookingView = this.selectedBookingView
            ? {
                ...this.selectedBookingView,
                paymentStatus: 'Refunded',
              }
            : this.mapToViewBooking(this.selectedBooking);
        }

        this.cdr.detectChanges();
      });
    });
  }

  private syncEditFormFromSelectedBooking(): void {
    if (!this.selectedBooking) {
      return;
    }

    this.editForm = {
      guestName: this.selectedBooking.guest_name || '',
      guestPhone: this.selectedBooking.guest_phone || '',
      checkIn: this.toDateInput(this.selectedBooking.check_in),
      checkOut: this.toDateInput(this.selectedBooking.check_out),
      guests: Math.max(1, Number(this.selectedBooking.guests) || 1),
      roomType: this.selectedBooking.room_type || this.selectedBookingView?.roomType || '',
      roomNumber: this.selectedBooking.room_number || this.selectedBookingView?.roomNumber || '',
      note: this.selectedBooking.note || '',
    };
  }

  private updateBookingListEntry(updatedBooking: Booking): void {
    const index = this.allBookings.findIndex((booking) => booking.id === updatedBooking._id);
    if (index === -1) {
      return;
    }

    this.allBookings[index] = this.mapToViewBooking(updatedBooking);
    this.applyPagination();
  }

  private toDateInput(value: string): string {
    if (!value) {
      return '';
    }

    return value.slice(0, 10);
  }

  private mapPaymentStatus(totalPrice: number, depositAmount: number, payment?: string, refundStatus?: string): PaymentStatus {
    if ((payment || '').trim().toLowerCase() === 'refunded') {
      return 'Refunded';
    }

    if ((refundStatus || '').trim().toLowerCase() === 'confirmed') {
      return 'Refunded';
    }

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
      case 'checked_in':
        return 'Checked In';
      case 'completed':
      case 'checked_out':
        return 'Checked Out';
      default:
        return 'Pending';
    }
  }

  private toApiStatus(status: BookingStatus): string {
    switch (status) {
      case 'Pending':
        return 'pending';
      case 'Confirmed':
        return 'confirmed';
      case 'Cancelled':
        return 'cancelled';
      case 'Checked In':
        return 'checked_in';
      case 'Checked Out':
        return 'checked_out';
      default:
        return 'pending';
    }
  }

  private getReceptionistNextStatus(status: BookingStatus): string | null {
    if (status === 'Confirmed') {
      return 'checked_in';
    }
    if (status === 'Checked In') {
      return 'checked_out';
    }
    return null;
  }

  private getManagerNextStatus(status: BookingStatus): string | null {
    if (status === 'Pending') {
      return 'confirmed';
    }
    if (status === 'Confirmed') {
      return 'checked_in';
    }
    if (status === 'Checked In') {
      return 'checked_out';
    }
    return null;
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
