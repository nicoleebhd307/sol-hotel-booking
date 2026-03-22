import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BookingFilterParams } from '../../models/booking.model';

@Component({
  selector: 'app-booking-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="bg-[#e7e3d5] rounded-[18px] px-4 py-2.5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5" style="font-family: 'Plus Jakarta Sans', sans-serif;">
      <div class="flex flex-col">
        <p class="h-7 text-[10px] font-bold uppercase tracking-[1.1px] leading-[1.15] text-[#514a3e] mb-1.5">Search<br />Identifier</p>
        <div class="relative">
          <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#9b9487]">badge</mat-icon>
          <input
            [(ngModel)]="filters.search"
            (ngModelChange)="emitFilter()"
            type="text"
            placeholder="ID or Phone Number"
            class="w-full bg-[#f8f7f3] rounded-[7px] border border-[rgba(0,0,0,0.04)] h-9 pl-9 pr-2.5 text-[13px] font-medium text-[#595247] placeholder:text-[#a49e90] focus:outline-none focus:ring-2 focus:ring-[#b79f61]"
          />
        </div>
      </div>

      <div class="flex flex-col">
        <p class="h-7 text-[10px] font-bold uppercase tracking-[1.1px] leading-[1.15] text-[#514a3e] mb-1.5">Status</p>
        <div class="relative">
          <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#9b9487]">fact_check</mat-icon>
          <select
            [(ngModel)]="filters.status"
            (ngModelChange)="emitFilter()"
            class="w-full bg-[#f8f7f3] rounded-[7px] border border-[rgba(0,0,0,0.04)] h-9 pl-9 pr-7 text-[13px] font-medium text-[#595247] appearance-none focus:outline-none focus:ring-2 focus:ring-[#b79f61]"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
          </select>
          <mat-icon class="absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#b1aa9b] pointer-events-none">expand_more</mat-icon>
        </div>
      </div>

      <div class="flex flex-col">
        <p class="h-7 text-[10px] font-bold uppercase tracking-[1.1px] leading-[1.15] text-[#514a3e] mb-1.5">Date<br />Range</p>
        <div class="relative">
          <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#9b9487]">calendar_today</mat-icon>
          <input
            [(ngModel)]="filters.dateRange"
            (ngModelChange)="emitFilter()"
            type="text"
            placeholder="Oct 12 - Oct 19, 2023"
            class="w-full bg-[#f8f7f3] rounded-[7px] border border-[rgba(0,0,0,0.04)] h-9 pl-9 pr-2.5 text-[13px] font-medium text-[#767062] placeholder:text-[#9d9789] focus:outline-none focus:ring-2 focus:ring-[#b79f61]"
          />
        </div>
      </div>

      <div class="flex flex-col">
        <p class="h-7 text-[10px] font-bold uppercase tracking-[1.1px] leading-[1.15] text-[#514a3e] mb-1.5">Room<br />Category</p>
        <div class="relative">
          <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#9b9487]">hotel</mat-icon>
          <select
            [(ngModel)]="filters.roomCategory"
            (ngModelChange)="emitFilter()"
            class="w-full bg-[#f8f7f3] rounded-[7px] border border-[rgba(0,0,0,0.04)] h-9 pl-9 pr-7 text-[13px] font-medium text-[#595247] appearance-none focus:outline-none focus:ring-2 focus:ring-[#b79f61]"
          >
            <option value="All">Room Types</option>
            <option value="Ocean Suite">Ocean Suite</option>
            <option value="Garden Villa">Garden Villa</option>
            <option value="Lagoon Penthouse">Lagoon Penthouse</option>
            <option value="Deluxe Room">Deluxe Room</option>
          </select>
          <mat-icon class="absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#b1aa9b] pointer-events-none">expand_more</mat-icon>
        </div>
      </div>
    </div>
  `,
})
export class BookingFilterComponent {
  @Output() filterChange = new EventEmitter<BookingFilterParams>();

  filters: BookingFilterParams = {
    search: '',
    status: 'All',
    dateFrom: '',
    dateTo: '',
    dateRange: '',
    roomCategory: 'All',
  };

  emitFilter(): void {
    const payload: BookingFilterParams = { ...this.filters };

    if (this.filters.dateRange && this.filters.dateRange.includes('-')) {
      const [fromPart, toPart] = this.filters.dateRange.split('-').map((part) => part.trim());
      const fromDate = new Date(fromPart);
      const toDate = new Date(toPart);

      payload.dateFrom = Number.isNaN(fromDate.getTime()) ? '' : fromDate.toISOString().slice(0, 10);
      payload.dateTo = Number.isNaN(toDate.getTime()) ? '' : toDate.toISOString().slice(0, 10);
    }

    this.filterChange.emit(payload);
  }
}
