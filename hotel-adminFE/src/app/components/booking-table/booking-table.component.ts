import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookingRole, BookingStatus, BookingView } from '../../models/booking.model';
import { BookingRowComponent } from '../booking-row/booking-row.component';

@Component({
  selector: 'app-booking-table',
  standalone: true,
  imports: [CommonModule, BookingRowComponent],
  template: `
    <div class="overflow-x-auto" style="font-family: 'Plus Jakarta Sans', sans-serif;">
      <table class="w-full min-w-[1080px]">
        <thead class="bg-[#f6f4ed] text-[#6f6a5e] text-[11px] uppercase tracking-[0.6px] font-semibold">
          <tr>
            <th class="py-4 px-4 text-left">Booking ID</th>
            <th class="py-4 px-4 text-left">Guest Details</th>
            <th class="py-4 px-4 text-left">Room</th>
            <th class="py-4 px-4 text-left">Schedule</th>
            <th class="py-4 px-4 text-left">Payment</th>
            <th class="py-4 px-4 text-left">Status</th>
            <th class="py-4 px-4 text-right"></th>
          </tr>
        </thead>

        <tbody class="bg-white">
          <tr *ngIf="loading">
            <td colspan="7" class="py-12 text-center text-[#7a7468]">Loading bookings...</td>
          </tr>

          <tr *ngIf="!loading && bookings.length === 0">
            <td colspan="7" class="py-12 text-center text-[#7a7468]">No bookings found.</td>
          </tr>

          <tr
            app-booking-row
            *ngFor="let booking of bookings; trackBy: trackByBookingId"
            [booking]="booking"
            [role]="role"
            [statusUpdating]="statusUpdatingIds.includes(booking.id)"
            (view)="view.emit($event)"
            (statusChange)="statusChange.emit($event)"
            (delete)="delete.emit($event)"
            class="border-b last:border-b-0 border-[rgba(213,204,186,0.42)]"
          ></tr>
        </tbody>
      </table>
    </div>
  `,
})
export class BookingTableComponent {
  @Input() bookings: BookingView[] = [];
  @Input() loading = false;
  @Input() role: BookingRole = 'receptionist';
  @Input() statusUpdatingIds: string[] = [];

  @Output() view = new EventEmitter<BookingView>();
  @Output() statusChange = new EventEmitter<{ booking: BookingView; status: BookingStatus }>();
  @Output() delete = new EventEmitter<BookingView>();

  trackByBookingId(_: number, booking: BookingView): string {
    return booking.id;
  }
}
