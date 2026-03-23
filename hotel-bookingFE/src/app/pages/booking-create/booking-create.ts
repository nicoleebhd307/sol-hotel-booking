import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { StickyNavbar } from '../../components/sticky-navbar/sticky-navbar';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { BookingCreateHero } from '../../components/booking-create/booking-create-hero/booking-create-hero';
import { BookingCreateSteps } from '../../components/booking-create/booking-create-steps/booking-create-steps';
import { BookingCreateSummary } from '../../components/booking-create/booking-create-summary/booking-create-summary';
import { HomeContent } from '../../services/home-content';
import { ApiService } from '../../services/api.service';

type Step = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-booking-create',
  standalone: true,
  imports: [CommonModule, StickyNavbar, SiteFooter, BookingCreateHero, BookingCreateSteps, BookingCreateSummary],
  templateUrl: './booking-create.html',
  styleUrl: './booking-create.css',
})
export class BookingCreate implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly homeContent = inject(HomeContent);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  // Route query params
  protected bookingId = '';
  protected roomId = '';
  protected roomTypeId = '';
  protected checkIn = '';
  protected checkOut = '';
  protected adults = 1;
  protected children = 1;

  // State signals
  protected readonly currentStep = signal<Step>(1);
  protected readonly isPhoneLoading = signal(false);
  protected readonly isBookingLoading = signal(false);
  protected readonly isPaymentLoading = signal(false);
  protected readonly errorMsg = signal('');
  protected readonly isNewCustomer = signal(false);
  protected readonly createdBooking = signal<any>(null);
  protected readonly policyAccepted = signal(false);
  protected readonly selectedPaymentMethod = signal<'card' | 'momo' | 'vnpay'>('card');
  protected readonly room = signal<any>(null);

  // Forms
  protected readonly phoneForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]]
  });

  protected readonly guestForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    identityId: ['', [Validators.required, Validators.minLength(6)]],
    contactPhone: [{ value: '', disabled: true }]
  });

  protected readonly cardForm = this.fb.group({
    cardholderName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
  });

  // Computed booking summary
  get nights(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const ms = new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime();
    return Math.max(0, Math.round(ms / 86400000));
  }

  get guestsLabel(): string {
    const parts: string[] = [];
    if (this.adults) parts.push(`${this.adults} Adult${this.adults > 1 ? 's' : ''}`);
    if (this.children) parts.push(`${this.children} Child${this.children > 1 ? 'ren' : ''}`);
    return parts.join(', ') || '1 Adult';
  }

  get roomName(): string {
    return this.room()?.room_type_id?.name || 'Selected Room';
  }

  get pricePerNight(): number {
    return this.room()?.room_type_id?.price_per_night || 0;
  }

  get roomRate(): number {
    return this.pricePerNight * this.nights;
  }

  get includedAdults(): number {
    return this.room()?.room_type_id?.capacity?.adults || 1;
  }

  get includedChildren(): number {
    return this.room()?.room_type_id?.capacity?.children || 0;
  }

  get includedTotalGuests(): number {
    return this.includedAdults + this.includedChildren;
  }

  get maxTotalGuestsAllowed(): number {
    return this.includedTotalGuests * 2;
  }

  get maxAdultsAllowed(): number {
    return this.includedAdults * 2;
  }

  get extraAdults(): number {
    return Math.max(0, this.adults - this.includedAdults);
  }

  get rawExtraGuestCharge(): number {
    return this.extraAdults * this.pricePerNight * 0.5 * this.nights;
  }

  get maxExtraGuestCharge(): number {
    return this.roomRate * 0.7;
  }

  get extraGuestCharge(): number {
    return Math.min(this.rawExtraGuestCharge, this.maxExtraGuestCharge);
  }

  get taxesAndFees(): number {
    const rt = this.room()?.room_type_id;
    if (!rt) return 0;
    const taxableBase = this.roomRate + this.extraGuestCharge;
    const sc = ((rt.service_charge ?? 5) / 100) * taxableBase;
    const vat = ((rt.vat ?? 10) / 100) * taxableBase;
    return sc + vat;
  }

  get totalAmount(): number {
    return this.roomRate + this.extraGuestCharge + this.taxesAndFees;
  }

  get depositAmount(): number {
    return this.totalAmount * 0.2;
  }

  get checkInFormatted(): string {
    if (!this.checkIn) return '—';
    return new Date(this.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  get checkOutFormatted(): string {
    if (!this.checkOut) return '—';
    return new Date(this.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  get roomImageUrl(): string {
    const rt = this.room()?.room_type_id;
    const imgUrl = rt?.imgURL || rt?.imageUrl;
    if (typeof imgUrl === 'string' && imgUrl.trim()) return imgUrl;

    const images = rt?.images;
    if (Array.isArray(images) && images.length > 0) return images[0];

    const image = rt?.image;
    if (Array.isArray(image) && image.length > 0) return image[0];

    return 'assets/images/Scenic Ocean View.png';
  }

  get roomView(): string {
    return this.room()?.room_type_id?.view || 'Oceanfront Sanctuary';
  }

  get isBookingInfoLocked(): boolean {
    return this.isStepCompleted(3);
  }

  ngOnInit(): void {
    this.errorMsg.set('');

    const params = this.route.snapshot.queryParamMap;
    this.bookingId = params.get('bookingId') || '';
    this.roomId = params.get('roomId') || '';
    this.roomTypeId = params.get('roomTypeId') || '';
    this.checkIn = params.get('checkIn') || '';
    this.checkOut = params.get('checkOut') || '';
    this.adults = parseInt(params.get('adults') || '1', 10);
    this.children = 1;

    if (!this.checkIn || !this.checkOut) {
      const today = new Date();
      const inDate = new Date(today);
      inDate.setDate(today.getDate() + 1);
      const outDate = new Date(inDate);
      outDate.setDate(inDate.getDate() + 1);
      this.checkIn = inDate.toISOString().slice(0, 10);
      this.checkOut = outDate.toISOString().slice(0, 10);
    }

    if (this.bookingId) {
      this.resumeBookingFlow(this.bookingId);
      return;
    }

    if (this.roomId) {
      this.loadRoomById(this.roomId);
      return;
    }

    if (this.roomTypeId) {
      this.api.getAvailableRooms(this.checkIn, this.checkOut, this.roomTypeId).subscribe({
        next: ({ rooms }) => {
          const firstRoom = rooms?.[0];
          if (!firstRoom?._id) {
            this.errorMsg.set('No available room found for selected dates. Please choose another room/date.');
            return;
          }
          this.errorMsg.set('');
          this.roomId = firstRoom._id;
          this.loadRoomById(this.roomId);
        },
        error: () => {
          this.errorMsg.set('Unable to load availability. Please try again.');
        }
      });
      return;
    }

    this.errorMsg.set('Missing room information. Please select a room first.');
  }

  private resumeBookingFlow(bookingId: string): void {
    this.api.getBookingById(bookingId).subscribe({
      next: ({ booking }) => {
        if (!booking?._id) {
          this.errorMsg.set('Booking not found. Please create a new booking.');
          return;
        }

        this.createdBooking.set(booking);

        if (booking.status === 'confirmed') {
          this.router.navigate(['/booking', booking._id]);
          return;
        }

        this.checkIn = typeof booking.check_in === 'string' ? booking.check_in.slice(0, 10) : this.checkIn;
        this.checkOut = typeof booking.check_out === 'string' ? booking.check_out.slice(0, 10) : this.checkOut;
        this.adults = Number(booking?.guests?.adults || this.adults);
        this.children = Number(booking?.guests?.children || this.children);

        const firstRoom = booking?.rooms?.[0]?.room_id;
        const roomId = typeof firstRoom === 'string' ? firstRoom : firstRoom?._id;
        if (roomId) {
          this.roomId = String(roomId);
        }

        const roomTypeId = typeof firstRoom?.room_type_id === 'string'
          ? firstRoom.room_type_id
          : firstRoom?.room_type_id?._id;
        if (roomTypeId) {
          this.roomTypeId = String(roomTypeId);
        }

        if (firstRoom && typeof firstRoom === 'object') {
          this.room.set(firstRoom);
        } else if (this.roomId) {
          this.loadRoomById(this.roomId);
        }

        this.currentStep.set(4);
        this.errorMsg.set('');
      },
      error: () => {
        this.errorMsg.set('Cannot resume booking payment. Please create a new booking.');
      }
    });
  }

  private loadRoomById(id: string): void {
    this.api.getRoomById(id).subscribe({
      next: (room) => {
        this.room.set(room);
        this.errorMsg.set('');
      },
      error: () => {
        this.errorMsg.set('Selected room was not found. Please choose another room.');
      }
    });
  }

  onCheckInChange(value: string): void {
    this.checkIn = value;
    this.errorMsg.set('');
    this.refreshRoomByAvailability();
  }

  onCheckOutChange(value: string): void {
    this.checkOut = value;
    this.errorMsg.set('');
    this.refreshRoomByAvailability();
  }

  onAdultsChange(value: string): void {
    const parsed = Number(value);
    const nextValue = Number.isFinite(parsed) ? Math.max(1, Math.min(this.maxAdultsAllowed, parsed)) : 1;
    if (Number.isFinite(parsed) && parsed > this.maxAdultsAllowed) {
      this.errorMsg.set(`Adults cannot exceed ${this.maxAdultsAllowed} for this room.`);
    } else {
      this.errorMsg.set('');
    }
    this.adults = nextValue;
  }

  private refreshRoomByAvailability(): void {
    if (!this.roomTypeId) return;
    if (!this.checkIn || !this.checkOut) return;

    const inDate = new Date(this.checkIn);
    const outDate = new Date(this.checkOut);
    if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime()) || outDate <= inDate) {
      this.errorMsg.set('Check-out date must be after check-in date.');
      return;
    }

    this.api.getAvailableRooms(this.checkIn, this.checkOut, this.roomTypeId).subscribe({
      next: ({ rooms }) => {
        const firstRoom = rooms?.[0];
        if (!firstRoom?._id) {
          this.errorMsg.set('No available room found for selected dates. Please choose another date.');
          return;
        }
        this.errorMsg.set('');
        this.roomId = firstRoom._id;
        this.loadRoomById(this.roomId);
      },
      error: () => {
        this.errorMsg.set('Unable to refresh room availability. Please try again.');
      }
    });
  }

  // ── Step 1: Phone lookup ──────────────────────────────────────────────────
  onPhoneContinue(): void {
    if (this.phoneForm.invalid) { this.phoneForm.markAllAsTouched(); return; }
    const phone = this.phoneForm.value.phone!.trim();
    this.isPhoneLoading.set(true);
    this.errorMsg.set('');

    this.api.lookupCustomerByPhone(phone).subscribe({
      next: (customer) => {
        this.isPhoneLoading.set(false);
        if (customer) {
          this.isNewCustomer.set(false);
          this.guestForm.patchValue({
            name: customer.name,
            email: customer.email,
            identityId: customer.identityId || '',
            contactPhone: phone
          });
        } else {
          this.isNewCustomer.set(true);
          this.guestForm.patchValue({ contactPhone: phone });
        }
        this.currentStep.set(2);
      },
      error: () => {
        this.isPhoneLoading.set(false);
        this.errorMsg.set('Failed to look up phone. Please try again.');
      }
    });
  }

  // ── Step 2: Guest info → go to policy step ────────────────────────────────
  onGuestContinue(): void {
    if (this.guestForm.invalid) { this.guestForm.markAllAsTouched(); return; }
    this.errorMsg.set('');
    this.currentStep.set(3);
  }

  // ── Step 3: Policy acceptance + create booking ────────────────────────────
  onConfirmPolicy(): void {
    if (!this.policyAccepted()) {
      this.errorMsg.set('Please accept the hotel policies to continue.');
      return;
    }
    this.isBookingLoading.set(true);
    this.errorMsg.set('');

    const gv = this.guestForm.getRawValue();
    const phone = this.phoneForm.value.phone!.trim();

    this.api.createBooking({
      customer: {
        name: gv.name!,
        email: gv.email!,
        phone,
        identityId: gv.identityId || undefined
      },
      roomIds: [this.roomId],
      check_in: this.checkIn,
      check_out: this.checkOut,
      guests: { adults: this.adults, children: this.children }
    }).subscribe({
      next: (booking) => {
        this.createdBooking.set(booking);
        this.isBookingLoading.set(false);
        this.bookingId = booking?._id || '';
        if (this.bookingId) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { bookingId: this.bookingId },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        }
        this.currentStep.set(4);
      },
      error: (err) => {
        this.isBookingLoading.set(false);
        this.errorMsg.set(err?.error?.message || 'Room is no longer available. Please choose another room.');
      }
    });
  }

  // ── Step 4: Pay deposit ───────────────────────────────────────────────────
  onPayDeposit(): void {
    if (this.selectedPaymentMethod() === 'card' && this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }

    const booking = this.createdBooking();
    if (!booking?._id) {
      this.errorMsg.set('Booking has not been created yet. Please complete the previous steps first.');
      return;
    }

    if (this.selectedPaymentMethod() === 'momo') {
      this.router.navigate(['/payment/momo'], {
        queryParams: {
          bookingId: booking._id,
          amount: this.depositAmount.toFixed(2)
        }
      });
      return;
    }

    this.isPaymentLoading.set(true);
    this.errorMsg.set('');

    const simulateStatus = undefined;

    this.api.payDeposit(booking._id, this.selectedPaymentMethod(), simulateStatus).subscribe({
      next: () => {
        this.isPaymentLoading.set(false);
        this.router.navigate(['/booking', booking._id]);
      },
      error: (err) => {
        this.isPaymentLoading.set(false);
        this.errorMsg.set(err?.error?.message || 'Payment failed. Please try again.');
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  setPaymentMethod(method: 'card' | 'momo' | 'vnpay'): void {
    this.selectedPaymentMethod.set(method);
    this.errorMsg.set('');
  }

  togglePolicy(): void {
    this.policyAccepted.set(!this.policyAccepted());
    this.errorMsg.set('');
  }

  isStepCompleted(step: Step): boolean {
    return this.currentStep() > step;
  }

  isStepActive(step: Step): boolean {
    return this.currentStep() === step;
  }

  isStepLocked(step: Step): boolean {
    return this.currentStep() < step;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
}
