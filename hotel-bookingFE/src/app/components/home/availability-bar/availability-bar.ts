import { Component, OnInit, DestroyRef, inject, ElementRef, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../services/api.service';
import { RoomType } from '../../../models/home.models';

interface CalendarDay {
  date: number;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

@Component({
  selector: 'app-availability-bar',
  imports: [CommonModule],
  templateUrl: './availability-bar.html',
  styleUrl: './availability-bar.css',
})
export class AvailabilityBar implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /* ── state ─────────────────────────────────── */
  checkIn = signal<string>('');
  checkOut = signal<string>('');
  adults = signal(2);
  children = signal(1);
  selectedRoomType = signal<RoomType | null>(null);
  roomTypes = signal<RoomType[]>([]);

  openDropdown = signal<'guests' | 'roomType' | null>(null);
  isSearching = signal(false);
  searchError = signal('');

  /* ── calendar state ────────────────────────── */
  calendarField = signal<'checkIn' | 'checkOut' | null>(null);
  calendarViewDate = signal<Date>(new Date());
  readonly weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  /* ── computed display values ────────────────── */
  checkInDisplay = computed(() => this.formatDate(this.checkIn()) || 'Select date');
  checkOutDisplay = computed(() => this.formatDate(this.checkOut()) || 'Select date');

  guestsDisplay = computed(() => {
    const a = this.adults();
    const c = this.children();
    const parts: string[] = [];
    if (a > 0) parts.push(`${a} Adult${a > 1 ? 's' : ''}`);
    if (c > 0) parts.push(`${c} Child${c > 1 ? 'ren' : ''}`);
    return parts.join(', ') || '0 Guests';
  });

  roomTypeDisplay = computed(() => this.selectedRoomType()?.name || 'All Room Types');

  /* ── min dates ─────────────────────────────── */
  today = this.toLocalDateStr(new Date());

  minCheckOut = computed(() => {
    const ci = this.checkIn();
    if (!ci) return this.today;
    const d = new Date(ci);
    d.setDate(d.getDate() + 1);
    return this.toLocalDateStr(d);
  });

  /* ── calendar computed ─────────────────────── */
  calendarMonthLabel = computed(() => {
    const d = this.calendarViewDate();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  calendarDays = computed((): CalendarDay[] => {
    const viewDate = this.calendarViewDate();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const ci = this.checkIn();
    const co = this.checkOut();
    const field = this.calendarField();
    const todayStr = this.today;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Monday = 0 ... Sunday = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: CalendarDay[] = [];

    // Previous month filler days
    const prevLast = new Date(year, month, 0);
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevLast.getDate() - i;
      const iso = this.toLocalDateStr(new Date(year, month - 1, d));
      days.push(this.buildDay(d, iso, false, todayStr, ci, co, field));
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const iso = this.toLocalDateStr(new Date(year, month, d));
      days.push(this.buildDay(d, iso, true, todayStr, ci, co, field));
    }

    // Next month filler days (fill to 42 cells = 6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const iso = this.toLocalDateStr(new Date(year, month + 1, d));
      days.push(this.buildDay(d, iso, false, todayStr, ci, co, field));
    }

    return days;
  });

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekLater = new Date(tomorrow);
    weekLater.setDate(weekLater.getDate() + 6);

    this.checkIn.set(this.toLocalDateStr(tomorrow));
    this.checkOut.set(this.toLocalDateStr(weekLater));

    this.api.getRoomTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(types => this.roomTypes.set(types));
  }

  /* ── calendar navigation ───────────────────── */
  openCalendar(field: 'checkIn' | 'checkOut'): void {
    this.openDropdown.set(null);
    if (this.calendarField() === field) {
      this.calendarField.set(null);
      return;
    }
    // Set view to the currently selected date's month, or today
    const current = field === 'checkIn' ? this.checkIn() : this.checkOut();
    const viewDate = current ? new Date(current + 'T00:00:00') : new Date();
    this.calendarViewDate.set(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
    this.calendarField.set(field);
  }

  prevMonth(): void {
    const d = this.calendarViewDate();
    this.calendarViewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.calendarViewDate();
    this.calendarViewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  selectCalendarDate(day: CalendarDay): void {
    if (day.isDisabled) return;
    const field = this.calendarField();
    if (!field) return;

    if (field === 'checkIn') {
      this.checkIn.set(day.iso);
      if (this.checkOut() && day.iso >= this.checkOut()) {
        const d = new Date(day.iso + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        this.checkOut.set(this.toLocalDateStr(d));
      }
      // Auto-switch to check-out selection
      this.calendarField.set('checkOut');
      const coDate = this.checkOut() ? new Date(this.checkOut() + 'T00:00:00') : new Date(day.iso + 'T00:00:00');
      this.calendarViewDate.set(new Date(coDate.getFullYear(), coDate.getMonth(), 1));
    } else {
      this.checkOut.set(day.iso);
      this.calendarField.set(null);
    }
  }

  private buildDay(
    date: number, iso: string, isCurrentMonth: boolean,
    todayStr: string, ci: string, co: string,
    field: 'checkIn' | 'checkOut' | null
  ): CalendarDay {
    const minDate = field === 'checkOut' ? this.minCheckOut() : todayStr;
    return {
      date,
      iso,
      isCurrentMonth,
      isToday: iso === todayStr,
      isSelected: iso === ci || iso === co,
      isRangeStart: iso === ci,
      isRangeEnd: iso === co,
      isInRange: !!ci && !!co && iso > ci && iso < co,
      isDisabled: !isCurrentMonth || iso < minDate,
    };
  }

  /* ── dropdown toggle ───────────────────────── */
  toggleDropdown(name: 'guests' | 'roomType'): void {
    this.calendarField.set(null);
    this.openDropdown.set(this.openDropdown() === name ? null : name);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.openDropdown.set(null);
      this.calendarField.set(null);
    }
  }

  /* ── guest counter ─────────────────────────── */
  adjustAdults(delta: number): void {
    const next = this.adults() + delta;
    if (next >= 1 && next <= 10) this.adults.set(next);
  }

  adjustChildren(delta: number): void {
    const next = this.children() + delta;
    if (next >= 0 && next <= 6) this.children.set(next);
  }

  /* ── room type ─────────────────────────────── */
  selectRoomType(rt: RoomType | null): void {
    this.selectedRoomType.set(rt);
    this.openDropdown.set(null);
  }

  /* ── search ────────────────────────────────── */
  search(): void {
    if (!this.checkIn() || !this.checkOut()) {
      this.searchError.set('Please select check-in and check-out dates.');
      return;
    }

    this.isSearching.set(true);
    this.searchError.set('');

    const ci = this.checkIn();
    const co = this.checkOut();
    const rtId = this.selectedRoomType()?._id;

    this.api.getAvailableRooms(ci, co, rtId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ rooms }) => {
          this.isSearching.set(false);
          if (!rooms?.length) {
            this.searchError.set('No rooms available for the selected dates. Please try different dates or room type.');
            return;
          }

          const room = rooms[0];
          this.router.navigate(['/booking-create'], {
            queryParams: {
              roomId: room._id,
              roomTypeId: room.room_type_id || rtId || '',
              checkIn: ci,
              checkOut: co,
              adults: String(this.adults()),
            }
          });
        },
        error: () => {
          this.isSearching.set(false);
          this.searchError.set('Unable to check availability. Please try again.');
        }
      });
  }

  /* ── helpers ───────────────────────────────── */
  private formatDate(isoStr: string): string {
    if (!isoStr) return '';
    const d = new Date(isoStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private toLocalDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
