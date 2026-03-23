import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { input } from '@angular/core';
import { HomePageData } from '../../models/home.models';

@Component({
  selector: 'app-site-footer',
  imports: [CommonModule, MatIconModule],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooter {
  readonly data = input<HomePageData['footer']>({
    logoUrl: '',
    address: '',
    phone: '',
    email: '',
    links: [],
    socials: [],
  });
}
