import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

type Step = 1 | 2 | 3 | 4;
type PaymentMethod = 'card' | 'momo' | 'vnpay';

@Component({
  selector: 'app-booking-create-steps',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-create-steps.html',
  styleUrl: './booking-create-steps.css'
})
export class BookingCreateSteps {
  readonly currentStep = input.required<Step>();
  readonly errorMsg = input<string>('');
  readonly isNewCustomer = input<boolean>(false);
  readonly isPhoneLoading = input<boolean>(false);
  readonly isBookingLoading = input<boolean>(false);
  readonly isPaymentLoading = input<boolean>(false);
  readonly policyAccepted = input<boolean>(false);
  readonly selectedPaymentMethod = input<PaymentMethod>('card');

  readonly phoneForm = input.required<FormGroup>();
  readonly guestForm = input.required<FormGroup>();
  readonly cardForm = input.required<FormGroup>();
  readonly depositAmount = input.required<number>();

  readonly phoneContinue = output<void>();
  readonly guestContinue = output<void>();
  readonly togglePolicy = output<void>();
  readonly confirmPolicy = output<void>();
  readonly payDeposit = output<void>();
  readonly selectPaymentMethod = output<PaymentMethod>();

  get phoneControl(): any {
    return this.phoneForm().controls['phone'];
  }

  get guestNameControl(): any {
    return this.guestForm().controls['name'];
  }

  get guestEmailControl(): any {
    return this.guestForm().controls['email'];
  }

  get guestIdentityControl(): any {
    return this.guestForm().controls['identityId'];
  }

  get guestPhoneControl(): any {
    return this.guestForm().controls['contactPhone'];
  }

  get cardholderControl(): any {
    return this.cardForm().controls['cardholderName'];
  }

  get cardNumberControl(): any {
    return this.cardForm().controls['cardNumber'];
  }

  get expiryControl(): any {
    return this.cardForm().controls['expiry'];
  }

  get cvvControl(): any {
    return this.cardForm().controls['cvv'];
  }

  isStepActive(step: Step): boolean {
    return this.currentStep() === step;
  }

  isStepCompleted(step: Step): boolean {
    return this.currentStep() > step;
  }

  isStepLocked(step: Step): boolean {
    return this.currentStep() < step;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
}
