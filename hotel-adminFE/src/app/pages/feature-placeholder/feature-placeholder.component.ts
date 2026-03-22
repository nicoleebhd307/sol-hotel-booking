import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderTopbarComponent } from '../../components/header-topbar/header-topbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-feature-placeholder',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderTopbarComponent],
  template: `
    <div class="flex bg-[#fcfaf1] min-h-screen">
      <div class="fixed left-0 top-0 w-[260px] h-screen overflow-y-auto">
        <app-sidebar></app-sidebar>
      </div>

      <div class="flex-1 ml-[260px] flex flex-col overflow-hidden">
        <app-header-topbar [userInfo]="userInfo"></app-header-topbar>

        <main class="flex-1 overflow-y-auto p-8">
          <section class="max-w-5xl mx-auto bg-white rounded-[24px] border border-[rgba(209,197,180,0.15)] p-10 text-center">
            <h1 class="text-4xl text-[#1d1c13] mb-3" style="font-family: 'Playfair Display', serif;">{{ title }}</h1>
            <p class="text-[#4e4639] text-base" style="font-family: 'Plus Jakarta Sans', sans-serif;">
              This module is ready for navigation and will be implemented in the next step.
            </p>
          </section>
        </main>
      </div>
    </div>
  `,
})
export class FeaturePlaceholderComponent {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  get title(): string {
    return this.route.snapshot.data['title'] ?? 'Feature';
  }

  get userInfo() {
    const current = this.authService.getCurrentUser();
    return {
      name: current?.name ?? 'User',
      role: current?.role ?? 'staff',
      profileImage: current?.profileImage ?? 'assets/images/admin-profile.png',
    };
  }
}
