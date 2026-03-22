import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckInGuest } from '../../services/dashboard.service';

export type { CheckInGuest };

@Component({
  selector: 'app-table-checkins',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-[32px] border border-[rgba(209,197,180,0.05)] p-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-[#1d1c13]" style="font-family: 'Playfair Display', serif;">
          Upcoming Check-ins
        </h3>
        <a href="/bookings" class="text-xs font-bold text-[#775a19] uppercase" style="font-family: 'Plus Jakarta Sans', sans-serif;">
          View Daily Log
        </a>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-[rgba(209,197,180,0.1)]">
            <tr>
              <th class="text-left py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">Guest Name</th>
              <th class="text-left py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">Room</th>
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
                <p class="text-[11px] text-[#8a7f6d] mt-0.5" style="font-family: 'Plus Jakarta Sans', sans-serif;">{{ guest.roomType }}</p>
              </td>
              <td class="py-4 text-sm text-[#4e4639]" style="font-family: 'Plus Jakarta Sans', sans-serif;">{{ guest.room }}</td>
              <td class="py-4 text-sm text-[#4e4639]" style="font-family: 'Plus Jakarta Sans', sans-serif;">{{ guest.time }}</td>
              <td class="py-4 text-right">
                <!-- Already checked in badge -->
                <ng-container *ngIf="guest.status === 'checked_in'; else checkInBtn">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[rgba(79,145,103,0.12)] text-[#2f6a45] text-xs font-bold uppercase" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#4f9167]"></span>
                    Checked In
                  </span>
                </ng-container>
                <ng-template #checkInBtn>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold uppercase transition-all"
                    [ngClass]="updatingId === guest.bookingId
                      ? 'bg-[rgba(119,90,25,0.08)] text-[#a0893d] cursor-not-allowed'
                      : 'bg-[rgba(119,90,25,0.1)] text-[#775a19] hover:bg-[rgba(119,90,25,0.2)]'"
                    [disabled]="updatingId === guest.bookingId"
                    (click)="checkIn.emit(guest)"
                    style="font-family: 'Plus Jakarta Sans', sans-serif;"
                  >
                    <span *ngIf="updatingId === guest.bookingId" class="w-3.5 h-3.5 border-2 border-[#a0893d] border-t-transparent rounded-full animate-spin"></span>
                    {{ updatingId === guest.bookingId ? 'Updating...' : 'Check In' }}
                  </button>
                </ng-template>
              </td>
            </tr>
            <!-- Empty state -->
            <tr *ngIf="guests.length === 0">
              <td colspan="4" class="py-8 text-center text-sm text-[#8a7f6d]" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                No upcoming check-ins today.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class TableCheckinsComponent {
  @Input() guests: CheckInGuest[] = [];
  @Input() updatingId: string | null = null;
  @Output() checkIn = new EventEmitter<CheckInGuest>();
}
