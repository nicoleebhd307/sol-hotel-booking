import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-booking-create-summary',
  standalone: true,
  templateUrl: './booking-create-summary.html',
  styleUrl: './booking-create-summary.css'
})
export class BookingCreateSummary {
  readonly roomImageUrl = input.required<string>();
  readonly roomView = input.required<string>();
  readonly roomName = input.required<string>();

  readonly checkIn = input.required<string>();
  readonly checkOut = input.required<string>();
  readonly nights = input.required<number>();
  readonly maxAdultsAllowed = input.required<number>();
  readonly adults = input.required<number>();
  readonly guestsLabel = input.required<string>();
  readonly isBookingInfoLocked = input.required<boolean>();

  readonly roomRate = input.required<number>();
  readonly extraGuestCharge = input.required<number>();
  readonly taxesAndFees = input.required<number>();
  readonly totalAmount = input.required<number>();
  readonly depositAmount = input.required<number>();

  readonly checkInChange = output<string>();
  readonly checkOutChange = output<string>();
  readonly adultsChange = output<string>();

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
}
