import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Menu, X, Flower2 } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  readonly menuIcon = Menu;
  readonly closeIcon = X;
  readonly flowerIcon = Flower2;

  isScrolled = signal(false);
  mobileMenuOpen = signal(false);

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled.set(window.scrollY > 80);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }
}
