import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { HomeContent } from '../../services/home-content';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink, SiteFooter],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.css'
})
export class PaymentResult implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly homeContent = inject(HomeContent);

  protected readonly navLinks = this.homeContent.getHomePageData().hero.navLinks;
  protected readonly logoUrl = this.homeContent.getHomePageData().hero.logoUrl;
  protected readonly reserveLabel = this.homeContent.getHomePageData().hero.reserveLabel;
  protected readonly footerData = this.homeContent.getHomePageData().footer;

  protected readonly isSuccess = signal(false);
  protected readonly bookingId = signal('');
  protected readonly orderId = signal('');
  protected readonly amount = signal('');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const payment = params.get('payment') || '';
    this.isSuccess.set(payment === 'momo_success');
    this.bookingId.set(params.get('bookingId') || '');
    this.orderId.set(params.get('orderId') || '');
    this.amount.set(params.get('amount') || '');
  }

  goToBookingDetail(): void {
    const id = this.bookingId();
    if (id) {
      this.router.navigate(['/booking', id]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
