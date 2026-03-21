import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  action?: 'logout';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  menuItems: MenuItem[] = [];

  bottomMenuItems: MenuItem[] = [
    { label: 'Settings', icon: 'settings', route: '/login' },
    { label: 'Logout', icon: 'logout', route: '/login', action: 'logout' },
  ];

  constructor(private authService: AuthService) {
    const dashboardRoute = this.authService.hasRole('manager') ? '/manager-dashboard' : '/dashboard';
    this.menuItems = [
      { label: 'Dashboard', icon: 'dashboard', route: dashboardRoute },
      { label: 'Bookings', icon: 'book_online', route: '/bookings' },
      { label: 'Rooms', icon: 'hotel', route: '/rooms' },
      { label: 'Customers', icon: 'groups', route: '/customers' },
      { label: 'Refunds', icon: 'payments', route: '/refunds' },
      { label: 'Reports', icon: 'monitoring', route: '/reports' },
    ];
  }

  handleMenuClick(event: Event, item: MenuItem): void {
    if (item.action !== 'logout') {
      return;
    }

    event.preventDefault();
    this.authService.logout().subscribe({
      error: () => {
        this.authService.forceLogout();
      },
    });
  }
}
