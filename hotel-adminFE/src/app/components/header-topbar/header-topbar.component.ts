import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UserInfo {
  name: string;
  role: string;
  profileImage: string;
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
        <button class="relative p-2 hover:bg-[#f5f3ec] rounded-lg transition-colors">
          <span class="material-symbols-outlined text-[#4e4639] text-[22px]">notifications</span>
          <span class="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-[#fef9ea]"></span>
        </button>

        <!-- Settings Button -->
        <button class="p-2 hover:bg-[#f5f3ec] rounded-lg transition-colors">
          <span class="material-symbols-outlined text-[#4e4639] text-[22px]">settings</span>
        </button>

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
            [src]="userInfo.profileImage"
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
  @Input() userInfo: UserInfo = {
    name: 'Mary Janes',
    role: 'Receptionist',
    profileImage: '/assets/images/admin-profile.png',
  };

  onProfileImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.src.endsWith('/assets/images/admin-profile.png')) {
      return;
    }

    img.src = '/assets/images/admin-profile.png';
  }
}
