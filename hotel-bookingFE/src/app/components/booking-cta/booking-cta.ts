import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-booking-cta',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './booking-cta.html',
})
export class BookingCtaComponent {
  readonly chevronDownIcon = ChevronDown;

  checkIn = 'Check In Date';
  checkOut = 'Check Out Date';
  selectedGuests = '2 Adults';
  guestsOpen = signal(false);

  guestOptions = ['1 Adult', '2 Adults', '2 Adults, 1 Child', '2 Adults, 2 Children', '3 Adults'];

  selectGuest(opt: string) {
    this.selectedGuests = opt;
    this.guestsOpen.set(false);
  }
}
