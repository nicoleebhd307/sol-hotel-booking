import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { HeaderTopbarComponent } from '../../../components/header-topbar/header-topbar.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { AdminCreateBookingPayload, BookingRole } from '../../../models/booking.model';
import { AuthService } from '../../../services/auth.service';
import { BookingService } from '../../../services/booking.service';
import { CustomerService } from '../../../services/customer.service';
import { AvailableRoomTypeGroup, RoomService } from '../../../services/room.service';

interface RoomOption {
  id: string;
  name: string;
  description: string;
  price: number;
  availableText: string;
  maxGuests: number;
  roomIds: string[];
  serviceCharge: number;
  vat: boolean;
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
  checkingMember = false;
  memberMessage = '';
  memberFound: boolean | null = null;
  loadingRooms = false;
  selectedRoom: RoomOption | null = null;
  createBookingForm!: FormGroup;

  userInfo = {
    name: 'Hotel Staff',
    role: 'receptionist',
    profileImage: 'assets/images/admin-profile.png',
  };

  roomOptions: RoomOption[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly bookingService: BookingService,
    private readonly roomService: RoomService,
    private readonly customerService: CustomerService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
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

    // When dates change, re-fetch available rooms
    this.createBookingForm.get('checkIn')?.valueChanges.subscribe(() => this.onDatesChanged());
    this.createBookingForm.get('checkOut')?.valueChanges.subscribe(() => this.onDatesChanged());

    this.resolveUserRole();
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

  get taxRate(): number {
    if (!this.selectedRoom) return 0.12;
    const sc = (this.selectedRoom.serviceCharge || 0) / 100;
    const vt = this.selectedRoom.vat ? 0.1 : 0;
    return sc + vt;
  }

  get tax(): number {
    return this.subtotal * this.taxRate;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  get taxLabel(): string {
    return `Taxes & Fees (${Math.round(this.taxRate * 100)}%)`;
  }

  get canCreateBooking(): boolean {
    return !this.isSubmitting && this.createBookingForm.valid && this.nights > 0 && !!this.selectedRoom && !this.hasGuestCapacityError();
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

    this.checkingMember = true;
    this.memberMessage = '';

    this.customerService.lookupByPhone(phone).subscribe({
      next: (customer) => {
        this.checkingMember = false;
        if (customer) {
          this.memberFound = true;
          this.createBookingForm.patchValue({
            fullName: customer.name || '',
            email: customer.email || '',
            identityNumber: customer.identityId || '',
          });
          this.memberMessage = 'Customer found — Autofilled information.';
        } else {
          this.memberFound = false;
          this.memberMessage = 'Can not find customer of given phone numer.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.checkingMember = false;
        this.memberFound = false;
        this.memberMessage = 'Try again. Failed to lookup customer.';
        this.cdr.detectChanges();
      },
    });
  }

  onCreateBooking(): void {
    this.createBookingForm.markAllAsTouched();
    this.applyGuestCapacityValidation();

    if (!this.canCreateBooking || !this.selectedRoom) {
      return;
    }

    const payload: AdminCreateBookingPayload = {
      customer: {
        name: this.createBookingForm.value.fullName || '',
        email: this.createBookingForm.value.email || '',
        phone: this.createBookingForm.value.phone || '',
        identityId: this.createBookingForm.value.identityNumber || '',
      },
      roomIds: [this.selectedRoom.roomIds[0]],
      check_in: this.createBookingForm.value.checkIn || '',
      check_out: this.createBookingForm.value.checkOut || '',
      guests: {
        adults: Number(this.createBookingForm.value.guests || 1),
        children: 0,
      },
      note: this.createBookingForm.value.note || '',
    };

    this.isSubmitting = true;

    this.bookingService.createAdminBooking(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/bookings']);
      },
      error: () => {
        this.isSubmitting = false;
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

  private onDatesChanged(): void {
    const checkIn = this.createBookingForm.value.checkIn;
    const checkOut = this.createBookingForm.value.checkOut;

    if (!checkIn || !checkOut || checkOut <= checkIn) {
      this.roomOptions = [];
      this.selectedRoom = null;
      this.createBookingForm.patchValue({ roomType: '', pricePerNight: 0 });
      return;
    }

    this.fetchAvailableRooms(checkIn, checkOut);
  }

  private fetchAvailableRooms(checkIn: string, checkOut: string): void {
    this.loadingRooms = true;
    this.roomService.getAvailableRooms(checkIn, checkOut).subscribe({
      next: (groups) => {
        this.roomOptions = groups.map((g) => this.mapGroupToOption(g));
        this.loadingRooms = false;

        // Reset selection if previously selected type is no longer available
        if (this.selectedRoom && !this.roomOptions.find(r => r.id === this.selectedRoom!.id)) {
          this.selectedRoom = null;
          this.createBookingForm.patchValue({ roomType: '', pricePerNight: 0 });
        }
      },
      error: () => {
        this.roomOptions = [];
        this.loadingRooms = false;
      },
    });
  }

  private mapGroupToOption(group: AvailableRoomTypeGroup): RoomOption {
    const rt = group.roomType;
    const count = group.availableCount;
    const maxGuests = (rt.capacity?.adults || 2) + (rt.capacity?.children || 0);

    let availableText: string;
    if (count === 0) {
      availableText = 'Sold out';
    } else if (count <= 3) {
      availableText = `${count} room${count > 1 ? 's' : ''} left`;
    } else {
      availableText = 'Plenty available';
    }

    return {
      id: rt._id,
      name: rt.name,
      description: rt.description || `${rt.area}m² · ${rt.bed_options.join(', ')}`,
      price: rt.price_per_night,
      availableText,
      maxGuests,
      roomIds: group.rooms.map(r => r._id),
      serviceCharge: rt.service_charge,
      vat: rt.vat,
    };
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

  private toIsoDate(value: Date): string {
    const tzOffsetMs = value.getTimezoneOffset() * 60000;
    return new Date(value.getTime() - tzOffsetMs).toISOString().slice(0, 10);
  }
}
