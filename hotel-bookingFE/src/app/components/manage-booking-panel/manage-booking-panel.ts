import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-booking-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-booking-panel.html',
  styleUrl: './manage-booking-panel.css',
})
export class ManageBookingPanel {
  readonly booking = input.required<any>();
  readonly payment = input<any>(null);
  readonly nights = input<number>(0);
  readonly nightsTotal = input<number>(0);

  readonly downloadPDF = output<void>();
  readonly cancelBooking = output<void>();

  onDownloadPDF(): void {
    this.downloadPDF.emit();
  }

  onCancelBooking(): void {
    this.cancelBooking.emit();
  }
}

