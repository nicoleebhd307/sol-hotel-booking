import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <p class="text-[11px] font-bold uppercase tracking-[0.9px] text-[#8b836f]">
        Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} entries
      </p>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="w-9 h-9 rounded-[11px] border border-[rgba(189,179,158,0.7)] bg-white text-[#6e675a] inline-flex items-center justify-center disabled:opacity-50"
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)"
        >
          <mat-icon class="text-[18px]">chevron_left</mat-icon>
        </button>

        <button
          type="button"
          *ngFor="let p of visiblePages"
          class="w-9 h-9 rounded-[11px] text-[13px] font-bold"
          [ngClass]="p === currentPage ? 'bg-[#7d6a2c] text-white' : 'border border-[rgba(189,179,158,0.7)] bg-white text-[#6e675a]'"
          (click)="changePage(p)"
        >
          {{ p }}
        </button>

        <span *ngIf="showEllipsis" class="px-1 text-[#8d8578] text-[13px]">...</span>

        <button
          type="button"
          class="w-9 h-9 rounded-[11px] border border-[rgba(189,179,158,0.7)] bg-white text-[#6e675a] inline-flex items-center justify-center disabled:opacity-50"
          [disabled]="currentPage === totalPages"
          (click)="changePage(currentPage + 1)"
        >
          <mat-icon class="text-[18px]">chevron_right</mat-icon>
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
