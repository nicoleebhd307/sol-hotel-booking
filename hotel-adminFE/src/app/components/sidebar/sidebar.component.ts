import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];

  bottomMenuItems: MenuItem[] = [
    { label: 'Logout', icon: 'logout', route: '/login', action: 'logout' },
  ];

  currentUser = {
    name: '',
    role: '',
    profileImage: '/assets/images/admin-profile.png',
  };

  private readonly platformId = inject(PLATFORM_ID);

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

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const isBrowser = isPlatformBrowser(this.platformId);
    const local = isBrowser ? localStorage.getItem('authUser') : null;
    const localUser = local ? JSON.parse(local) : null;

    const rawRole = user?.role ?? localUser?.role ?? '';
    this.currentUser = {
      name: user?.name ?? localUser?.name ?? 'Hotel Staff',
      role: rawRole === 'manager' ? 'Manager' : rawRole === 'receptionist' ? 'Receptionist' : rawRole,
      profileImage: user?.profileImage ?? localUser?.profileImage ?? '/assets/images/admin-profile.png',
    };
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
