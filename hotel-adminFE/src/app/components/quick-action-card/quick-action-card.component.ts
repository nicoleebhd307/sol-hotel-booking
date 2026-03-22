import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ActionCardData {
  title: string;
  icon: string;
  isPrimary?: boolean;
}

@Component({
  selector: 'app-quick-action-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="handleClick()"
      [ngClass]="isPrimary 
        ? 'bg-gradient-to-r from-[#775a19] to-[#c5a059] text-white shadow-md hover:shadow-lg' 
        : 'bg-white border border-[rgba(209,197,180,0.2)] text-[#4e4639] hover:bg-[#f5f3ec] hover:border-[rgba(209,197,180,0.3)]'"
      class="w-full rounded-[32px] px-8 py-4 font-medium transition-all duration-300 flex items-center justify-between gap-6 flex-1 min-h-[60px]"
      style="font-family: 'Plus Jakarta Sans', sans-serif;"
    >
      <!-- Left side: Icon + Text -->
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <span class="material-symbols-outlined text-[26px] flex-shrink-0">{{ data.icon }}</span>
        <div class="leading-tight whitespace-nowrap min-w-0" [ngClass]="titleClass">
          {{ normalizedTitle }}
        </div>
      </div>
      <!-- Right side: Arrow -->
      <span class="material-symbols-outlined text-[22px] flex-shrink-0">arrow_forward</span>
    </button>
  `,
})
export class QuickActionCardComponent {
  @Input() data!: ActionCardData;
  @Input() isPrimary = false;
  @Input() route = '';

  constructor(private router: Router) {}

  get normalizedTitle(): string {
    return this.data.title.replace(/<br\s*\/?\s*>/gi, ' ');
  }

  get titleClass(): string {
    return this.normalizedTitle.length > 16 ? 'text-[14px] sm:text-[15px] md:text-base' : 'text-base';
  }

  handleClick(): void {
    if (!this.route) {
      return;
    }

    this.router.navigateByUrl(this.route);
  }
}
