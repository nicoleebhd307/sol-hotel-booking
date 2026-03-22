import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BookingFilterParams } from '../../models/booking.model';
import { RoomService, RoomType } from '../../services/room.service';

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

      <!-- Date Range with dropdown picker -->
      <div class="flex flex-col">
        <p class="h-7 text-[10px] font-bold uppercase tracking-[1.1px] leading-[1.15] text-[#514a3e] mb-1.5">Date<br />Range</p>
        <div class="relative">
          <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#9b9487] z-[1]">calendar_today</mat-icon>
          <button
            type="button"
            class="w-full bg-[#f8f7f3] rounded-[7px] border border-[rgba(0,0,0,0.04)] h-9 pl-9 pr-2.5 text-left text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#b79f61] cursor-pointer"
            [class.text-\[#767062\]]="dateRangeLabel !== ''"
            [class.text-\[#9d9789\]]="dateRangeLabel === ''"
            (click)="toggleDatePicker($event)"
          >
            {{ dateRangeLabel || 'Select date range' }}
          </button>

          <!-- Date picker dropdown -->
          <div
            *ngIf="showDatePicker"
            class="absolute top-[calc(100%+6px)] left-0 z-50 bg-white rounded-[12px] border border-[rgba(214,205,187,0.7)] shadow-lg p-4 min-w-[280px]"
          >
            <div class="space-y-3">
              <div>
                <label class="block text-[11px] font-semibold text-[#514a3e] uppercase tracking-wide mb-1">From</label>
                <input
                  type="date"
                  [ngModel]="dateFrom"
                  (ngModelChange)="onDateFromChange($event)"
                  class="w-full bg-[#f8f7f3] rounded-[7px] border border-[rgba(0,0,0,0.08)] h-9 px-3 text-[13px] font-medium text-[#595247] focus:outline-none focus:ring-2 focus:ring-[#b79f61]"
                />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#514a3e] uppercase tracking-wide mb-1">To</label>
                <input
                  type="date"
                  [ngModel]="dateTo"
                  (ngModelChange)="onDateToChange($event)"
                  [min]="dateFrom"
                  class="w-full bg-[#f8f7f3] rounded-[7px] border border-[rgba(0,0,0,0.08)] h-9 px-3 text-[13px] font-medium text-[#595247] focus:outline-none focus:ring-2 focus:ring-[#b79f61]"
                />
              </div>
              <div class="flex items-center justify-between pt-1">
                <button
                  type="button"
                  class="text-[12px] font-medium text-[#9b9487] hover:text-[#7c6a39]"
                  (click)="clearDateRange()"
                >
                  Clear
                </button>
                <button
                  type="button"
                  class="text-[12px] font-semibold text-white bg-[#7d6a2c] hover:bg-[#6e5d27] px-4 h-8 rounded-[7px]"
                  (click)="applyDateRange()"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Room Category with dynamic options from API -->
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
            <option *ngFor="let rt of roomTypes" [value]="rt.name">{{ rt.name }}</option>
          </select>
          <mat-icon class="absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#b1aa9b] pointer-events-none">expand_more</mat-icon>
        </div>
      </div>
    </div>
  `,
})
export class BookingFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<BookingFilterParams>();

  filters: BookingFilterParams = {
    search: '',
    status: 'All',
    dateFrom: '',
    dateTo: '',
    dateRange: '',
    roomCategory: 'All',
  };

  roomTypes: RoomType[] = [];
  showDatePicker = false;
  dateFrom = '';
  dateTo = '';

  constructor(
    private roomService: RoomService,
    private elRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.roomService.getRoomTypes().subscribe({
      next: (types) => (this.roomTypes = types),
    });
  }

  get dateRangeLabel(): string {
    if (!this.filters.dateFrom && !this.filters.dateTo) return '';
    const from = this.filters.dateFrom ? this.formatDisplayDate(this.filters.dateFrom) : '...';
    const to = this.filters.dateTo ? this.formatDisplayDate(this.filters.dateTo) : '...';
    return `${from} – ${to}`;
  }

  toggleDatePicker(event: Event): void {
    event.stopPropagation();
    this.showDatePicker = !this.showDatePicker;
  }

  onDateFromChange(value: string): void {
    this.dateFrom = value;
    if (this.dateTo && this.dateTo < value) {
      this.dateTo = value;
    }
  }

  onDateToChange(value: string): void {
    this.dateTo = value;
  }

  applyDateRange(): void {
    this.filters.dateFrom = this.dateFrom;
    this.filters.dateTo = this.dateTo;
    this.filters.dateRange = this.dateRangeLabel;
    this.showDatePicker = false;
    this.emitFilter();
  }

  clearDateRange(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.filters.dateFrom = '';
    this.filters.dateTo = '';
    this.filters.dateRange = '';
    this.showDatePicker = false;
    this.emitFilter();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showDatePicker && !this.elRef.nativeElement.contains(event.target)) {
      this.showDatePicker = false;
    }
  }

  emitFilter(): void {
    const payload: BookingFilterParams = { ...this.filters };
    this.filterChange.emit(payload);
  }

  private formatDisplayDate(isoDate: string): string {
    const date = new Date(isoDate + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
