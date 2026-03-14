import { Component } from '@angular/core';
import { LucideAngularModule, Instagram, Twitter, Youtube } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  imports: [LucideAngularModule],
  templateUrl: './footer.html',
})
export class FooterComponent {
  readonly instagramIcon = Instagram;
  readonly twitterIcon = Twitter;
  readonly youtubeIcon = Youtube;

  currentYear = new Date().getFullYear();
}
