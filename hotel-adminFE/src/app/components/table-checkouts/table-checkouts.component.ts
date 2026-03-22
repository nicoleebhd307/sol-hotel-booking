import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckOutGuest } from '../../services/dashboard.service';

export type { CheckOutGuest };

@Component({
  selector: 'app-table-checkouts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-[32px] border border-[rgba(209,197,180,0.05)] p-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-[#1d1c13]" style="font-family: 'Playfair Display', serif;">
          Upcoming Check-outs
        </h3>
        <a href="/bookings" class="text-xs font-bold text-[#775a19] uppercase" style="font-family: 'Plus Jakarta Sans', sans-serif;">
          Full Departure List
        </a>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-[rgba(209,197,180,0.1)]">
            <tr>
              <th class="text-left py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">Guest Name</th>
              <th class="text-left py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">Room</th>
              <th class="text-left py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">Status</th>
              <th class="text-left py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">Time</th>
              <th class="text-right py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let guest of guests; let last = last"
              [class]="!last ? 'border-b border-[rgba(209,197,180,0.08)]' : ''"
            >
              <td class="py-4">
                <p class="text-[14px] font-semibold text-[#1d1c13]" style="font-family: 'Plus Jakarta Sans', sans-serif;">{{ guest.guestName }}</p>
              </td>
              <td class="py-4 text-sm text-[#4e4639]" style="font-family: 'Plus Jakarta Sans', sans-serif;">{{ guest.room }}</td>
              <td class="py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase"
                  [ngClass]="guest.status === 'checked_in'
                    ? 'bg-[rgba(79,145,103,0.12)] text-[#2f6a45]'
                    : 'bg-[rgba(60,119,130,0.12)] text-[#3c7782]'"
                  style="font-family: 'Plus Jakarta Sans', sans-serif;"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    [ngClass]="guest.status === 'checked_in' ? 'bg-[#4f9167]' : 'bg-[#3c7782]'"
                  ></span>
                  {{ guest.status === 'checked_in' ? 'Checked In' : 'Confirmed' }}
                </span>
              </td>
              <td class="py-4 text-sm text-[#4e4639]" style="font-family: 'Plus Jakarta Sans', sans-serif;">{{ guest.checkoutTime }}</td>
              <td class="py-4 text-right">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold uppercase transition-all"
                  [ngClass]="updatingId === guest.bookingId
                    ? 'bg-[rgba(0,104,123,0.06)] text-[#4d8591] cursor-not-allowed'
                    : 'bg-[rgba(0,104,123,0.1)] text-[#00687b] hover:bg-[rgba(0,104,123,0.18)]'"
                  [disabled]="updatingId === guest.bookingId"
                  (click)="checkOut.emit(guest)"
                  style="font-family: 'Plus Jakarta Sans', sans-serif;"
                >
                  <span *ngIf="updatingId === guest.bookingId" class="w-3.5 h-3.5 border-2 border-[#4d8591] border-t-transparent rounded-full animate-spin"></span>
                  {{ updatingId === guest.bookingId ? 'Updating...' : 'Check Out' }}
                </button>
              </td>
            </tr>
            <!-- Empty state -->
            <tr *ngIf="guests.length === 0">
              <td colspan="5" class="py-8 text-center text-sm text-[#8a7f6d]" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                No upcoming check-outs today.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class TableCheckoutsComponent {
  @Input() guests: CheckOutGuest[] = [];
  @Input() updatingId: string | null = null;
  @Output() checkOut = new EventEmitter<CheckOutGuest>();
}
