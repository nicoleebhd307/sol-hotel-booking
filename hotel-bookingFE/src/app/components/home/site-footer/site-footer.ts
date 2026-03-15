import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { input } from '@angular/core';
import { HomePageData } from '../../../models/home.models';

@Component({
  selector: 'app-site-footer',
  imports: [MatIconModule],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooter {
  readonly data = input.required<HomePageData['footer']>();
}
