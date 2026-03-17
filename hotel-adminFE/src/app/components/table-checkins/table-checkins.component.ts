import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CheckInGuest {
  id: number;
  guestName: string;
  room: string;
  time: string;
  roomType: string;
}

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
        <a href="#" class="text-xs font-bold text-[#775a19] uppercase" style="font-family: 'Plus Jakarta Sans', sans-serif;">
          View Daily Log
        </a>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <!-- Table Header -->
          <thead class="border-b border-[rgba(209,197,180,0.1)]">
            <tr>
              <th class="text-left py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                Guest Name
              </th>
              <th class="text-left py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                Room
              </th>
              <th class="text-left py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                Time
              </th>
              <th class="text-right py-4 text-xs font-bold text-[#4e4639] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                Action
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody>
            <tr
              *ngFor="let guest of guests; let last = last"
              [ngClass]="{ 'border-t border-[rgba(209,197,180,0.05)]': !last }"
            >
              <td class="py-4 text-base font-bold text-[#1d1c13]" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                {{ guest.guestName }}
              </td>
              <td class="py-4 text-sm text-[#4e4639]" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                {{ guest.room }}
              </td>
              <td class="py-4 text-sm text-[#4e4639]" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                {{ guest.time }}
              </td>
              <td class="py-4 text-right">
                <button
                  class="bg-[rgba(119,90,25,0.1)] text-[#775a19] rounded-[12px] px-4 py-2 text-xs font-bold uppercase hover:bg-[rgba(119,90,25,0.2)] transition-colors"
                  style="font-family: 'Plus Jakarta Sans', sans-serif;"
                >
                  Check In
                </button>
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
}
