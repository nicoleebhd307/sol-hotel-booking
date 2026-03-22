import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DashboardCardData {
  label: string;
  value: number | string;
  percentage: number;
  trend: 'up' | 'down';
  icon: string;
}

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-[24px] border border-[rgba(209,197,180,0.05)] shadow-sm p-6 hover:shadow-md transition-shadow">
      <!-- Icon and Trend Badge -->
      <div class="flex justify-between items-start mb-8">
        <span class="material-symbols-outlined text-[30px] text-[#775a19]">{{ data.icon }}</span>
        <span 
          [ngClass]="data.trend === 'up' 
            ? 'text-xs font-bold text-[#00687b]' 
            : 'text-xs font-bold text-[#ba1a1a]'"
        >
          {{ data.trend === 'up' ? '+' : '' }}{{ data.percentage }}%
        </span>
      </div>

      <!-- Title -->
      <p class="text-sm font-medium text-[#4e4639] mb-2" style="font-family: 'Plus Jakarta Sans', sans-serif;">
        {{ data.label }}
      </p>

      <!-- Value -->
      <h3 class="text-3xl font-bold text-[#1d1c13]" style="font-family: 'Plus Jakarta Sans', sans-serif;">
        {{ data.value }}
      </h3>
    </div>
  `,
})
export class DashboardCardComponent {
  @Input() data!: DashboardCardData;
}
