import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-booking-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-booking-panel.html',
  styleUrl: './manage-booking-panel.css',
})
export class ManageBookingPanel {
  private readonly router = inject(Router);

  protected readonly paymentSummary = {
    nights: 7,
    nightRate: 14350,
    subtotal: 14350,
    serviceCharge: 2152.50,
    ecoFee: 70,
    total: 16572.50,
    currency: '$'
  };

  protected readonly paymentMethod = {
    type: 'Visa',
    last4: '4242',
    processedDate: '09/24/24'
  };

  onDownloadPDF() {
    // Generate PDF (mock implementation)
    console.log('Downloading booking confirmation PDF...');
  }

  onCancelBooking() {
    this.router.navigate(['/cancel-booking']);
  }
}

