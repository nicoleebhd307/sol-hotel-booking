import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CheckOutGuest {
  id: number;
  guestName: string;
  room: string;
  status: string;
  amount?: number;
  checkoutTime?: string;
}

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
        <a href="#" class="text-xs font-bold text-[#775a19] uppercase" style="font-family: 'Plus Jakarta Sans', sans-serif;">
          Full Departure List
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
                Status
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
              <td class="py-4">
                <span
                  [ngClass]="
                    guest.status === 'Paid'
                      ? 'bg-[rgba(0,104,123,0.1)] text-[#00687b]'
                      : 'bg-[rgba(186,26,26,0.1)] text-[#ba1a1a]'
                  "
                  class="px-3 py-1 rounded-[12px] text-xs font-bold uppercase tracking-wider"
                  style="font-family: 'Plus Jakarta Sans', sans-serif;"
                >
                  {{ guest.status }}
                </span>
              </td>
              <td class="py-4 text-right">
                <span class="material-symbols-outlined text-[22px] cursor-pointer hover:opacity-80 transition-opacity text-[#775a19]" title="View details">
                  receipt_long
                </span>
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
}
