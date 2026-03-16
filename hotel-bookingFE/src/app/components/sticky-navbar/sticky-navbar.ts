import { Component, signal, HostListener, inject, NgZone } from '@angular/core';
import { input } from '@angular/core';

interface NavLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-sticky-navbar',
  imports: [],
  templateUrl: './sticky-navbar.html',
  styleUrl: './sticky-navbar.css',
  standalone: true,
  host: {
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class StickyNavbar {
  readonly navLinks = input.required<NavLink[]>();
  readonly logoUrl = input.required<string>();
  readonly reserveLabel = input<string>('Reserve now');

  protected isScrolled = signal(false);
  protected isMenuOpen = signal(false);
  private ngZone = inject(NgZone);

  onWindowScroll() {
    const scrollTop = window.scrollY;
    const shouldBeScrolled = scrollTop > 50;
    if (shouldBeScrolled !== this.isScrolled()) {
      this.ngZone.run(() => {
        this.isScrolled.set(shouldBeScrolled);
      });
    }
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.isMenuOpen.set(false);
    }
  }

  toggleMenu() {
    this.isMenuOpen.update((state) => !state);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
