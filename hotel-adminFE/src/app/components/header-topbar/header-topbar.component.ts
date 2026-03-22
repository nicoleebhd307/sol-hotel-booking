import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UserInfo {
  name: string;
  role: string;
  profileImage: string;
}

interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

@Component({
  selector: 'app-header-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-[#fcfaf1] h-20 px-10 flex items-center justify-between border-b border-[rgba(209,197,180,0.1)] sticky top-0 z-50 backdrop-blur-[12px]">
      <!-- Search Bar -->
      <div class="flex-1 max-w-[576px]">
        <div class="relative">
          <input
            type="text"
            placeholder="Search bookings, guests, or rooms..."
            class="w-full bg-white rounded-[12px] px-12 py-3 text-sm placeholder-[#6b7280] border border-[rgba(209,197,180,0.2)] focus:outline-none focus:border-[#c5a059]"
            style="font-family: 'Plus Jakarta Sans', sans-serif;"
          />
          <span class="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6b7280] text-[20px]">
            search
          </span>
        </div>
      </div>

      <!-- Right Side Controls -->
      <div class="flex items-center gap-6 pl-10">
        <!-- Notification Button -->
        <div class="relative">
          <button
            type="button"
            class="relative p-2 hover:bg-[#f5f3ec] rounded-lg transition-colors"
            (click)="toggleNotifications()"
            aria-label="Toggle notifications"
          >
            <span class="material-symbols-outlined text-[#4e4639] text-[22px]">notifications</span>
            <span
              *ngIf="unreadCount > 0"
              class="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-[#fef9ea]"
            ></span>
          </button>

          <div
            *ngIf="showNotifications"
            class="absolute right-0 top-12 w-[320px] bg-white border border-[rgba(209,197,180,0.35)] rounded-[14px] shadow-[0_12px_36px_rgba(46,40,29,0.16)] overflow-hidden z-[60]"
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-[rgba(209,197,180,0.28)]">
              <p class="text-sm font-bold text-[#1d1c13]" style="font-family: 'Plus Jakarta Sans', sans-serif;">Notifications</p>
              <button
                type="button"
                class="text-xs text-[#775a19] hover:underline"
                style="font-family: 'Plus Jakarta Sans', sans-serif;"
                (click)="markAllAsRead()"
              >
                Mark all as read
              </button>
            </div>

            <div class="max-h-[280px] overflow-y-auto">
              <button
                *ngFor="let item of notifications"
                type="button"
                class="w-full text-left px-4 py-3 border-b border-[rgba(209,197,180,0.2)] hover:bg-[#faf7ee] transition-colors"
                [ngClass]="item.isRead ? 'bg-white' : 'bg-[#fffaf0]'"
                (click)="markAsRead(item)"
              >
                <div class="flex items-start gap-2">
                  <span
                    class="mt-2 inline-block w-2 h-2 rounded-full"
                    [ngClass]="item.isRead ? 'bg-[#d6c9ac]' : 'bg-[#ba1a1a]'"
                  ></span>
                  <div class="min-w-0 flex-1">
                    <p class="text-[13px] font-semibold text-[#2c2a20]" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                      {{ item.title }}
                    </p>
                    <p class="text-xs text-[#5d5548] leading-5" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                      {{ item.message }}
                    </p>
                    <p class="text-[11px] text-[#8a7f6d] mt-1" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                      {{ item.time }}
                    </p>
                  </div>
                </div>
              </button>

              <div
                *ngIf="notifications.length === 0"
                class="px-4 py-6 text-center text-sm text-[#6d6457]"
                style="font-family: 'Plus Jakarta Sans', sans-serif;"
              >
                No notifications yet.
              </div>
            </div>
          </div>
        </div>

        <!-- Vertical Divider -->
        <div class="w-px h-10 bg-[rgba(209,197,180,0.3)]"></div>

        <!-- User Profile -->
        <div class="flex items-center gap-3 pl-6">
          <div class="flex flex-col items-end">
            <p class="text-sm font-bold text-[#1d1c13]" style="font-family: 'Plus Jakarta Sans', sans-serif;">
              {{ userInfo.name }}
            </p>
            <p class="text-xs font-bold text-[#775a19] uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">
              {{ userInfo.role }}
            </p>
          </div>
          <img
            [src]="resolveProfileImage(userInfo.profileImage)"
            alt="Profile"
            class="w-10 h-10 rounded-[12px] border-2 border-[rgba(197,160,89,0.3)] object-cover"
            (error)="onProfileImageError($event)"
          />
        </div>
      </div>
    </header>
  `,
})
export class HeaderTopbarComponent {
  private readonly fallbackProfileImage = '/assets/images/admin-profile.png';
  showNotifications = false;

  notifications: HeaderNotification[] = [
    {
      id: 'n1',
      title: 'New booking confirmed',
      message: 'Booking BK-24031 has been confirmed for guest Elena Rodriguez.',
      time: '2 minutes ago',
      isRead: false,
    },
    {
      id: 'n2',
      title: 'Upcoming check-in',
      message: 'Room 305 check-in starts in 30 minutes.',
      time: '10 minutes ago',
      isRead: false,
    },
    {
      id: 'n3',
      title: 'Refund request pending',
      message: 'Refund request RR-174023 is waiting for confirmation.',
      time: '25 minutes ago',
      isRead: true,
    },
  ];

  @Input() userInfo: UserInfo = {
    name: 'Mary Janes',
    role: 'Receptionist',
    profileImage: '/assets/images/admin-profile.png',
  };

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  get unreadCount(): number {
    return this.notifications.filter((item) => !item.isRead).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(item: HeaderNotification): void {
    item.isRead = true;
  }

  markAllAsRead(): void {
    this.notifications = this.notifications.map((item) => ({ ...item, isRead: true }));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showNotifications) {
      return;
    }

    const target = event.target as Node | null;
    if (target && this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.showNotifications = false;
  }

  resolveProfileImage(value: string): string {
    if (!value || typeof value !== 'string') {
      return this.fallbackProfileImage;
    }

    const normalized = value.trim();
    if (!normalized) {
      return this.fallbackProfileImage;
    }

    if (/^https?:\/\//i.test(normalized) || normalized.startsWith('/assets/')) {
      return normalized;
    }

    if (normalized.startsWith('assets/')) {
      return `/${normalized}`;
    }

    return this.fallbackProfileImage;
  }

  onProfileImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) {
      return;
    }

    // Prevent retry loops while always falling back to a valid absolute asset path.
    if (img.dataset['fallbackApplied'] === '1') {
      return;
    }

    img.dataset['fallbackApplied'] = '1';
    img.src = this.fallbackProfileImage;
  }
}
