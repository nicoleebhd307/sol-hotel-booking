import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { finalize, timeout } from 'rxjs';
import { HeaderTopbarComponent } from '../../components/header-topbar/header-topbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { RefundRequest } from '../../models/admin-booking.model';
import { AdminBookingService } from '../../services/admin-booking.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';

type RefundFilter = 'all' | 'pending' | 'confirmed' | 'rejected';
type RefundActionType = 'confirm' | 'reject';

@Component({
  selector: 'app-refunds',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, SidebarComponent, HeaderTopbarComponent],
  templateUrl: './refunds.component.html',
  styleUrl: './refunds.component.css',
})
export class RefundsComponent implements OnInit {
  loading = false;
  actionLoadingId = '';
  refunds: RefundRequest[] = [];
  filteredRefunds: RefundRequest[] = [];
  pendingAction: { type: RefundActionType; refund: RefundRequest } | null = null;
  successMessage = '';
  errorMessage = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly platformId = inject(PLATFORM_ID);
  private hasLoadedInitially = false;

  statusFilter: RefundFilter = 'all';
  searchTerm = '';

  userInfo = {
    name: 'Hotel Staff',
    role: 'receptionist',
    profileImage: 'assets/images/admin-profile.png',
  };

  constructor(
    private adminBookingService: AdminBookingService,
    private bookingService: BookingService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.resolveUserInfo();

    if (isPlatformBrowser(this.platformId) && !this.hasLoadedInitially) {
      this.hasLoadedInitially = true;
      setTimeout(() => this.loadRefunds(), 0);
    }
  }

  loadRefunds(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.adminBookingService.getRefundRequests(this.statusFilter).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.refunds = response.data || [];
          this.applyClientFilters();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.refunds = [];
          this.applyClientFilters();
          this.loading = false;
          this.cdr.detectChanges();
          this.showError('Failed to load refund requests.');
        });
      },
    });
  }

  onStatusFilterChange(): void {
    this.loadRefunds();
  }

  onSearchChange(): void {
    this.applyClientFilters();
  }

  confirmRefund(refund: RefundRequest): void {
    this.openActionModal('confirm', refund);
  }

  rejectRefund(refund: RefundRequest): void {
    this.openActionModal('reject', refund);
  }

  openActionModal(type: RefundActionType, refund: RefundRequest): void {
    if (!this.canProcessRefund(refund) || this.actionLoadingId) {
      return;
    }

    this.pendingAction = { type, refund };
  }

  closeActionModal(): void {
    if (this.actionLoadingId) {
      return;
    }

    this.pendingAction = null;
  }

  executePendingAction(): void {
    if (!this.pendingAction || this.actionLoadingId) {
      return;
    }

    const { type, refund } = this.pendingAction;
    if (!this.canProcessRefund(refund)) {
      this.pendingAction = null;
      this.showError('Refund can only be processed when deposit amount is greater than zero.');
      return;
    }

    this.actionLoadingId = refund.bookingId;

    const request$ = type === 'confirm'
      ? this.adminBookingService.confirmRefund(refund.bookingId, 'Approved by admin')
      : this.adminBookingService.rejectRefund(refund.bookingId, 'Rejected by admin');

    request$
      .pipe(
        timeout(10000),
        finalize(() => {
          this.ngZone.run(() => {
            this.actionLoadingId = '';
            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.pendingAction = null;
            this.showSuccess(type === 'confirm' ? 'Refund confirmed successfully.' : 'Refund rejected successfully.');

            const updatedRefund = response?.data?.refund;
            if (updatedRefund) {
              this.refunds = this.refunds.map((item) => (item.bookingId === updatedRefund.bookingId ? { ...item, ...updatedRefund } : item));
              this.applyClientFilters();
            }

            if (type === 'confirm') {
              this.bookingService.syncRefundedPayment(refund.bookingId);
            }

            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.showError(type === 'confirm' ? 'Failed to confirm refund.' : 'Failed to reject refund.');
            this.cdr.detectChanges();
          });
        },
      });
  }

  isActionLoading(bookingId: string): boolean {
    return this.actionLoadingId === bookingId;
  }

  canProcessRefund(refund: RefundRequest): boolean {
    return refund.status === 'pending' && refund.depositAmount > 0 && !this.isActionLoading(refund.bookingId);
  }

  getConfirmButtonLabel(refund: RefundRequest): string {
    if (this.isActionLoading(refund.bookingId)) {
      return 'Processing...';
    }

    return refund.status === 'confirmed' ? 'Refunded' : 'Confirm';
  }

  getActionTitle(type: RefundActionType): string {
    return type === 'confirm' ? 'Confirm Refund' : 'Reject Refund';
  }

  getActionDescription(type: RefundActionType, refund: RefundRequest): string {
    if (type === 'confirm') {
      return `Confirm refund for booking ${refund.bookingId} with amount ${this.formatAmount(refund.depositAmount)}?`;
    }

    return `Reject refund request for booking ${refund.bookingId} with amount ${this.formatAmount(refund.depositAmount)}?`;
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    this.resetToastTimer();
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    this.resetToastTimer();
  }

  private resetToastTimer(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
      this.toastTimer = null;
    }, 3500);
  }

  formatAmount(amount: number): string {
    return `$${new Intl.NumberFormat('en-US').format(amount || 0)}`;
  }

  formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }

    return parsed.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusClass(status: RefundRequest['status']): string {
    if (status === 'confirmed') {
      return 'bg-[#e9f7ec] text-[#246a38]';
    }

    if (status === 'rejected') {
      return 'bg-[#fce8e8] text-[#a84545]';
    }

    return 'bg-[#fff3da] text-[#8a6a16]';
  }

  private applyClientFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredRefunds = this.refunds.filter((item) => {
      if (!search) {
        return true;
      }

      const haystack = `${item.id} ${item.bookingId} ${item.phone} ${item.customerName}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  private resolveUserInfo(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.userInfo = {
      name: user.name || 'Hotel Staff',
      role: user.role,
      profileImage: user.profileImage || 'assets/images/admin-profile.png',
    };
  }
}
