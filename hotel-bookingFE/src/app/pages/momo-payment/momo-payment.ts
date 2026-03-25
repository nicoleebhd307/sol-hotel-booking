import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SiteFooter } from '../../components/site-footer/site-footer';
import { HomeContent } from '../../services/home-content';
import { ApiService } from '../../services/api.service';

type MomoChannel = 'qr' | 'card';

@Component({
  selector: 'app-momo-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SiteFooter],
  templateUrl: './momo-payment.html',
  styleUrl: './momo-payment.css'
})
export class MomoPaymentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly homeContent = inject(HomeContent);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  protected readonly selectedChannel = signal<MomoChannel>('qr');
  protected readonly isSubmitting = signal(false);
  protected readonly errorMsg = signal('');
  protected readonly lastSessionInfo = signal('');

  protected bookingId = '';
  protected depositAmount = 0;
  protected readonly defaultVisaTestCode =
    'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';

  protected readonly cardForm = this.fb.group({
    cardholderName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
    visaTestCode: [this.defaultVisaTestCode, Validators.required]
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.bookingId = params.get('bookingId') || '';

    const amountRaw = params.get('amount') || '0';
    const parsedAmount = Number(amountRaw);
    this.depositAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

    if (!this.bookingId) {
      this.errorMsg.set('Missing booking reference. Please return to booking page and try again.');
    }
  }

  setChannel(channel: MomoChannel): void {
    this.selectedChannel.set(channel);
    this.errorMsg.set('');
    this.lastSessionInfo.set('');
  }

  payWithQr(): void {
    if (!this.bookingId) {
      this.errorMsg.set('Missing booking reference.');
      return;
    }

    this.initializeMomoSession('qr');
  }

  payWithCard(): void {
    if (!this.bookingId) {
      this.errorMsg.set('Missing booking reference.');
      return;
    }

    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }

    this.initializeMomoSession('card', this.cardForm.value.visaTestCode || undefined);
  }

  private initializeMomoSession(channel: MomoChannel, paymentCode?: string): void {
    this.isSubmitting.set(true);
    this.errorMsg.set('');
    this.lastSessionInfo.set('');

    this.api.initMomoV2Session(this.bookingId, { channel, paymentCode }).subscribe({
      next: (session) => {
        this.isSubmitting.set(false);

        if (session?.payUrl) {
          window.location.href = session.payUrl;
          return;
        }

        this.lastSessionInfo.set(`Mode: ${session?.mode || 'unknown'} | RequestType: ${session?.requestType || 'n/a'}`);
        this.errorMsg.set(session?.message || 'MoMo session was created but payUrl is missing.');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMsg.set(err?.error?.message || 'MoMo init failed. Please try again.');
      }
    });
  }

  get qrPayload(): string {
    return `momo://pay?bookingId=${encodeURIComponent(this.bookingId)}&amount=${Math.round(this.depositAmount * 100) / 100}`;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  goBackToBookingCreate(): void {
    this.router.navigate(['/booking-create']);
  }
}
