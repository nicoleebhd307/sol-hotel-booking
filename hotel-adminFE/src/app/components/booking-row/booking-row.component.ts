import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BookingRole, BookingStatus, BookingView } from '../../models/booking.model';

@Component({
  selector: 'tr[app-booking-row]',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <td class="py-3 px-4 text-[13px] font-semibold text-[#8d7a43]">#{{ booking.id }}</td>

    <td class="py-3 px-4 align-top">
      <p class="text-[14px] leading-[1.2] font-semibold text-[#2d2b24]" style="font-family: 'Plus Jakarta Sans', sans-serif;">{{ booking.guestName }}</p>
      <p class="text-[12px] leading-[1.2] text-[#6d6558] mt-1">{{ booking.phone }}</p>
    </td>

    <td class="py-3 px-4 align-top">
      <p class="text-[13px] leading-[1.2] text-[#2f2c23]">{{ booking.roomType }}</p>
      <p class="text-[11px] leading-[1.2] text-[#7d7668] mt-1">{{ booking.roomNumber }}</p>
    </td>

    <td class="py-3 px-4 text-[12px] text-[#6a6254] align-top">
      <div class="space-y-1">
        <div class="grid grid-cols-[16px_1fr] items-center gap-2">
          <mat-icon class="text-[15px] text-[#8f8879]">login</mat-icon>
          <p class="leading-tight">{{ booking.checkIn | date: 'MMM d, y' }}</p>
        </div>

        <div class="grid grid-cols-[16px_1fr] items-center gap-2">
          <mat-icon class="text-[15px] text-[#8f8879]">logout</mat-icon>
          <p class="leading-tight">{{ booking.checkOut | date: 'MMM d, y' }}</p>
        </div>
      </div>
    </td>

    <td class="py-3 px-4 align-top">
      <span class="inline-flex px-3.5 py-1 rounded-full text-[13px] font-semibold uppercase" [ngClass]="paymentClass">
        {{ booking.paymentStatus }}
      </span>
    </td>

    <td class="py-3 px-4 align-top">
      <div *ngIf="canEditStatus; else readonlyStatus" class="inline-flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" [ngClass]="statusDotClass"></span>
        <select
          class="h-8 min-w-[132px] bg-[#f8f7f3] rounded-[7px] border border-[rgba(0,0,0,0.08)] px-2.5 text-[12px] text-[#595247] focus:outline-none focus:ring-2 focus:ring-[#b79f61] disabled:opacity-60"
          [value]="statusSelection"
          [disabled]="!canEditStatus || statusUpdating"
          (change)="onStatusSelect($event)"
        >
          <option *ngFor="let status of statusOptions" [value]="status">{{ status }}</option>
        </select>
      </div>

      <ng-template #readonlyStatus>
        <span class="inline-flex items-center gap-2 text-[13px] font-medium" [ngClass]="statusTextClass">
          <span class="w-2.5 h-2.5 rounded-full" [ngClass]="statusDotClass"></span>
          {{ booking.status }}
        </span>
      </ng-template>
    </td>

    <td class="py-3 px-4 align-top">
      <div class="flex items-center justify-end gap-1.5 min-w-[106px]">
        <button type="button" class="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-[#f1ede1]" (click)="view.emit(booking)">
          <mat-icon class="text-[16px] text-[#6f695d]">visibility</mat-icon>
        </button>

        <button
          type="button"
          class="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-[#f8ecec]"
          (click)="delete.emit(booking)"
        >
          <mat-icon class="text-[16px] text-[#6f695d]">cancel</mat-icon>
        </button>
      </div>
    </td>
  `,
})
export class BookingRowComponent implements OnChanges {
  @Input({ required: true }) booking!: BookingView;
  @Input() role: BookingRole = 'receptionist';
  @Input() statusUpdating = false;

  @Output() view = new EventEmitter<BookingView>();
  @Output() delete = new EventEmitter<BookingView>();
  @Output() statusChange = new EventEmitter<{ booking: BookingView; status: BookingStatus }>();

  statusSelection: BookingStatus = 'Pending';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['booking']) {
      this.statusSelection = this.booking.status;
    }
  }

  get statusTextClass(): string {
    if (this.booking.status === 'Confirmed') {
      return 'text-[#3b3a34]';
    }
    if (this.booking.status === 'Pending') {
      return 'text-[#857e72]';
    }
    if (this.booking.status === 'Checked In') {
      return 'text-[#2f6a45]';
    }
    if (this.booking.status === 'Checked Out') {
      return 'text-[#6b7384]';
    }
    return 'text-[#b04a4a]';
  }

  get statusDotClass(): string {
    if (this.booking.status === 'Confirmed') {
      return 'bg-[#3c7782]';
    }
    if (this.booking.status === 'Pending') {
      return 'bg-[#d3cbb9]';
    }
    if (this.booking.status === 'Checked In') {
      return 'bg-[#4f9167]';
    }
    if (this.booking.status === 'Checked Out') {
      return 'bg-[#9ea7bb]';
    }
    return 'bg-[#b53f3f]';
  }

  get statusOptions(): BookingStatus[] {
    return [this.booking.status, ...this.getAllowedNextStatuses(this.booking.status, this.role)];
  }

  get canEditStatus(): boolean {
    return this.getAllowedNextStatuses(this.booking.status, this.role).length > 0;
  }

  get paymentClass(): string {
    if (this.booking.paymentStatus === 'Paid') {
      return 'bg-[#d7ecf2] text-[#4d8591]';
    }
    if (this.booking.paymentStatus === 'Partial') {
      return 'bg-[#e7e2d4] text-[#7a7158]';
    }
    return 'bg-[#f3e2e2] text-[#bb5b5b]';
  }

  onStatusSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedStatus = target.value as BookingStatus;

    if (selectedStatus === this.booking.status) {
      this.statusSelection = this.booking.status;
      return;
    }

    this.statusSelection = this.booking.status;
    this.statusChange.emit({ booking: this.booking, status: selectedStatus });
  }

  private getAllowedNextStatuses(status: BookingStatus, role: BookingRole): BookingStatus[] {
    if (role === 'receptionist') {
      switch (status) {
        case 'Confirmed':
          return ['Checked In'];
        case 'Checked In':
          return ['Checked Out'];
        default:
          return [];
      }
    }

    switch (status) {
      case 'Pending':
        return ['Confirmed', 'Cancelled'];
      case 'Confirmed':
        return ['Checked In', 'Cancelled'];
      case 'Checked In':
        return ['Checked Out'];
      default:
        return [];
    }
  }
}
