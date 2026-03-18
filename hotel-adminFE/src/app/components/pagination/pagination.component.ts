import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12px] text-[#5f5748]">
      <p>Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} bookings</p>

      <div class="flex items-center gap-1 text-[#756e60]">
        <button
          type="button"
          class="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-40"
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)"
        >
          <mat-icon class="text-[15px]">chevron_left</mat-icon>
        </button>

        <button
          type="button"
          *ngFor="let p of visiblePages"
          class="w-6 h-6 rounded-full text-[12px]"
          [ngClass]="p === currentPage ? 'bg-[#8f742f] text-white font-semibold' : 'text-[#70695a]'"
          (click)="changePage(p)"
        >
          {{ p }}
        </button>

        <span *ngIf="showEllipsis" class="px-1 text-[#8d8578]">...</span>

        <button
          type="button"
          class="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-40"
          [disabled]="currentPage === totalPages"
          (click)="changePage(currentPage + 1)"
        >
          <mat-icon class="text-[15px]">chevron_right</mat-icon>
        </button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 15;
  @Input() currentPage = 1;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, idx) => idx + 1);
  }

  get visiblePages(): number[] {
    return this.pages.slice(0, 3);
  }

  get showEllipsis(): boolean {
    return this.totalPages > 3;
  }

  get startItem(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.pageChange.emit(page);
  }
}
