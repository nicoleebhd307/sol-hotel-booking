import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderTopbarComponent } from '../../../components/header-topbar/header-topbar.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { BookingDraft, BookingRole, CreateBookingDraftPayload, CreateBookingPayload } from '../../../models/booking.model';
import { AuthService } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';

interface RoomOption {
  id: string;
  name: string;
  description: string;
  price: number;
  availableText: string;
  maxGuests: number;
}

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, SidebarComponent, HeaderTopbarComponent],
  templateUrl: './create-booking.component.html',
  styleUrl: './create-booking.component.css',
})
export class CreateBookingComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  role: BookingRole = 'receptionist';
  isSubmitting = false;
  selectedRoom: RoomOption | null = null;
  createBookingForm!: FormGroup;
  draftMessage = '';
  currentDraftId: string | null = null;

  userInfo = {
    name: 'Hotel Staff',
    role: 'receptionist',
    profileImage: 'assets/images/admin-profile.png',
  };

  readonly roomOptions: RoomOption[] = [
    {
      id: 'room-ocean-villa',
      name: 'Ocean Overwater Villa',
      description: 'Private deck with direct lagoon access',
      price: 1250,
      availableText: '2 rooms left',
      maxGuests: 4,
    },
    {
      id: 'room-sunset-suite',
      name: 'The Sunset Suite',
      description: 'Panoramic views with deep soaking tub',
      price: 890,
      availableText: '5 rooms left',
      maxGuests: 3,
    },
    {
      id: 'room-deluxe-palm',
      name: 'Deluxe Palm Room',
      description: 'Tropical garden views with king bed',
      price: 550,
      availableText: 'Plenty available',
      maxGuests: 2,
    },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly bookingService: BookingService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.createBookingForm = this.fb.group({
      phone: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      identityNumber: ['', Validators.required],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]],
      roomType: ['', Validators.required],
      pricePerNight: [0, [Validators.required, Validators.min(1)]],
      note: [''],
    }, { validators: [this.dateRangeValidator()] });

    this.createBookingForm.get('guests')?.valueChanges.subscribe(() => {
      this.applyGuestCapacityValidation();
    });

    this.resolveUserRole();
    this.selectRoom(this.roomOptions[1]);
    this.restoreDraft();
  }

  get todayIsoDate(): string {
    return this.toIsoDate(new Date());
  }

  get minCheckOutDate(): string {
    const checkIn = this.createBookingForm?.value?.checkIn;
    if (!checkIn) {
      return this.todayIsoDate;
    }

    const nextDay = new Date(checkIn);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.toIsoDate(nextDay);
  }

  get nights(): number {
    const checkIn = this.createBookingForm.value.checkIn;
    const checkOut = this.createBookingForm.value.checkOut;

    if (!checkIn || !checkOut) {
      return 0;
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffMs = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(diffMs / 86400000);

    return Number.isFinite(days) && days > 0 ? days : 0;
  }

  get subtotal(): number {
    const price = Number(this.createBookingForm.value.pricePerNight || 0);
    return this.nights * price;
  }

  get tax(): number {
    return this.subtotal * 0.12;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  get canCreateBooking(): boolean {
    return !this.isSubmitting && this.createBookingForm.valid && this.nights > 0 && !this.hasGuestCapacityError();
  }

  selectRoom(room: RoomOption): void {
    this.selectedRoom = room;
    this.createBookingForm.patchValue({
      roomType: room.name,
      pricePerNight: room.price,
    });
    this.applyGuestCapacityValidation();
  }

  onCheckMember(): void {
    const phone = this.createBookingForm.value.phone?.trim();
    if (!phone) {
      return;
    }

    // Placeholder behavior until member lookup endpoint is available.
    this.createBookingForm.patchValue({
      note: `Member check requested for ${phone}`,
    });
  }

  onCreateBooking(): void {
    this.createBookingForm.markAllAsTouched();
    this.applyGuestCapacityValidation();

    if (!this.canCreateBooking) {
      return;
    }

    const payload: CreateBookingPayload = {
      guestName: this.createBookingForm.value.fullName || '',
      phone: this.createBookingForm.value.phone || '',
      email: this.createBookingForm.value.email || '',
      identityNumber: this.createBookingForm.value.identityNumber || '',
      checkIn: this.createBookingForm.value.checkIn || '',
      checkOut: this.createBookingForm.value.checkOut || '',
      guests: Number(this.createBookingForm.value.guests || 1),
      roomType: this.createBookingForm.value.roomType || '',
      totalPrice: this.total,
      pricePerNight: Number(this.createBookingForm.value.pricePerNight || 0),
      status: 'confirmed',
      note: this.createBookingForm.value.note || '',
    };

    this.isSubmitting = true;

    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        if (this.currentDraftId) {
          this.bookingService.deleteBookingDraft(this.currentDraftId).subscribe({
            next: () => {
              this.currentDraftId = null;
              this.draftMessage = '';
              this.router.navigate(['/bookings']);
            },
            error: () => {
              this.router.navigate(['/bookings']);
            },
          });
          return;
        }

        this.router.navigate(['/bookings']);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  onSaveDraft(): void {
    const payload: CreateBookingDraftPayload = {
      draftId: this.currentDraftId || undefined,
      formValue: {
        phone: this.createBookingForm.value.phone || '',
        fullName: this.createBookingForm.value.fullName || '',
        email: this.createBookingForm.value.email || '',
        identityNumber: this.createBookingForm.value.identityNumber || '',
        checkIn: this.createBookingForm.value.checkIn || '',
        checkOut: this.createBookingForm.value.checkOut || '',
        guests: Number(this.createBookingForm.value.guests || 1),
        roomType: this.createBookingForm.value.roomType || '',
        pricePerNight: Number(this.createBookingForm.value.pricePerNight || 0),
        note: this.createBookingForm.value.note || '',
      },
      selectedRoomId: this.selectedRoom?.id || '',
    };

    this.bookingService.saveBookingDraft(payload).subscribe({
      next: (savedDraft) => {
        this.currentDraftId = savedDraft._id;
        this.draftMessage = `Draft saved at ${new Date(savedDraft.updatedAt).toLocaleTimeString()}`;
      },
      error: () => {
        this.draftMessage = 'Failed to save draft';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }

  trackRoomById(_: number, room: RoomOption): string {
    return room.id;
  }

  hasControlError(controlName: string, errorKey: string): boolean {
    const control = this.createBookingForm.get(controlName);
    return !!control && control.touched && control.hasError(errorKey);
  }

  hasDateRangeError(): boolean {
    return !!this.createBookingForm.errors?.['invalidDateRange'] &&
      ((this.createBookingForm.get('checkIn')?.touched ?? false) || (this.createBookingForm.get('checkOut')?.touched ?? false));
  }

  hasCheckInPastError(): boolean {
    return !!this.createBookingForm.errors?.['checkInPast'] && (this.createBookingForm.get('checkIn')?.touched ?? false);
  }

  hasGuestCapacityError(): boolean {
    const control = this.createBookingForm.get('guests');
    return !!control?.hasError('exceedsCapacity') && (control.touched || control.dirty);
  }

  get selectedRoomCapacityLabel(): string {
    if (!this.selectedRoom) {
      return '';
    }
    return `Max ${this.selectedRoom.maxGuests} guests`;
  }

  get draftTimestampLabel(): string {
    if (!this.draftMessage) {
      return 'No draft saved yet';
    }
    return this.draftMessage;
  }

  private resolveUserRole(): void {
    const user = this.authService.getCurrentUser();
    const isBrowser = isPlatformBrowser(this.platformId);
    const local = isBrowser ? localStorage.getItem('authUser') : null;
    const localUser = local ? JSON.parse(local) : null;
    const role = user?.role ?? localUser?.role;

    this.role = role === 'manager' ? 'manager' : 'receptionist';

    this.userInfo = {
      name: user?.name ?? localUser?.name ?? 'Hotel Staff',
      role: this.role,
      profileImage: user?.profileImage ?? localUser?.profileImage ?? 'assets/images/admin-profile.png',
    };
  }

  private dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const checkIn = group.get('checkIn')?.value;
      const checkOut = group.get('checkOut')?.value;

      if (!checkIn || !checkOut) {
        return null;
      }

      const today = this.toIsoDate(new Date());

      if (checkIn < today) {
        return { checkInPast: true };
      }

      if (checkOut <= checkIn) {
        return { invalidDateRange: true };
      }

      return null;
    };
  }

  private applyGuestCapacityValidation(): void {
    const guestsControl = this.createBookingForm.get('guests');
    if (!guestsControl) {
      return;
    }

    const currentErrors = { ...(guestsControl.errors || {}) };
    delete currentErrors['exceedsCapacity'];

    const guestsValue = Number(guestsControl.value || 1);
    const maxGuests = this.selectedRoom?.maxGuests;

    if (maxGuests && guestsValue > maxGuests) {
      guestsControl.setErrors({ ...currentErrors, exceedsCapacity: true });
      return;
    }

    const hasOtherErrors = Object.keys(currentErrors).length > 0;
    guestsControl.setErrors(hasOtherErrors ? currentErrors : null);
  }

  private restoreDraft(): void {
    this.bookingService.getLatestBookingDraft().subscribe({
      next: (draft) => {
        if (!draft) {
          return;
        }

        this.currentDraftId = draft._id;

        const room = this.roomOptions.find((item) => item.id === draft.selectedRoomId);
        this.createBookingForm.patchValue(draft.formValue);

        if (room) {
          this.selectedRoom = room;
        }

        this.applyGuestCapacityValidation();
        this.draftMessage = `Draft restored from ${new Date(draft.updatedAt).toLocaleString()}`;
      },
      error: () => {
        this.draftMessage = '';
      },
    });
  }

  private toIsoDate(value: Date): string {
    const tzOffsetMs = value.getTimezoneOffset() * 60000;
    return new Date(value.getTime() - tzOffsetMs).toISOString().slice(0, 10);
  }
}
