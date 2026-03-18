import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BookingRole, BookingView } from '../../models/booking.model';

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
          <mat-icon class="text-[15px] text-[#8f8879]">logout</mat-icon>
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
      <span class="inline-flex items-center gap-2 text-[13px] font-medium" [ngClass]="statusTextClass">
        <span class="w-2.5 h-2.5 rounded-full" [ngClass]="statusDotClass"></span>
        {{ booking.status }}
      </span>
    </td>

    <td class="py-3 px-4 align-top">
      <div class="flex items-center justify-end gap-1.5 min-w-[106px]">
        <button type="button" class="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-[#f1ede1]" (click)="view.emit(booking)">
          <mat-icon class="text-[16px] text-[#6f695d]">visibility</mat-icon>
        </button>

        <button
          *ngIf="role === 'receptionist'"
          type="button"
          class="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-[#edf3e6]"
          (click)="checkIn.emit(booking)"
        >
          <mat-icon class="text-[16px] text-[#66604f]">check_circle</mat-icon>
        </button>

        <button
          *ngIf="role === 'manager'"
          type="button"
          class="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-[#f1ede1]"
          (click)="edit.emit(booking)"
        >
          <mat-icon class="text-[16px] text-[#6f695d]">check_circle</mat-icon>
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
export class BookingRowComponent {
  @Input({ required: true }) booking!: BookingView;
  @Input() role: BookingRole = 'receptionist';

  @Output() view = new EventEmitter<BookingView>();
  @Output() checkIn = new EventEmitter<BookingView>();
  @Output() edit = new EventEmitter<BookingView>();
  @Output() delete = new EventEmitter<BookingView>();

  get statusTextClass(): string {
    if (this.booking.status === 'Confirmed' || this.booking.status === 'Completed') {
      return 'text-[#3b3a34]';
    }
    if (this.booking.status === 'Pending' || this.booking.status === 'Checked In' || this.booking.status === 'Checked Out') {
      return 'text-[#857e72]';
    }
    return 'text-[#b04a4a]';
  }

  get statusDotClass(): string {
    if (this.booking.status === 'Confirmed' || this.booking.status === 'Completed') {
      return 'bg-[#3c7782]';
    }
    if (this.booking.status === 'Pending' || this.booking.status === 'Checked In' || this.booking.status === 'Checked Out') {
      return 'bg-[#d3cbb9]';
    }
    return 'bg-[#b53f3f]';
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
}
