import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FilterOption {
  label: string;
  key: string;
  options: string[];
}

export interface FilterState {
  roomType?: string;
  priceRange?: string;
  guests?: string;
  view?: string;
}

@Component({
  selector: 'app-rooms-filter',
  imports: [CommonModule],
  templateUrl: './rooms-filter.html',
  styleUrl: './rooms-filter.css'
})
export class RoomsFilterComponent {
  readonly filters: FilterOption[] = [
    {
      key: 'roomType',
      label: 'Room Type',
      options: ['Deluxe', 'Superior']
    },
    {
      key: 'priceRange',
      label: 'Price Range',
      options: [
        '1,000,000 - 1,200,000',
        '1,200,000 - 1,400,000',
        '1,400,000 - 1,700,000',
        '1,700,000+'
      ]
    },
    {
      key: 'guests',
      label: 'Guests',
      options: ['1-2', '2-3', '3-4', '4+']
    },
    {
      key: 'view',
      label: 'View',
      options: ['Sea View', 'Street View', 'Forest View', 'Garden View']
    }
  ];

  readonly resultsCount = input<number>(0);
  readonly totalRooms = input<number>(0);
  
  readonly filterChange = output<FilterState>();

  private selectedFilters: FilterState = {};

  onFilterChange(key: any, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    const newFilters: any = { ...this.selectedFilters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    this.selectedFilters = newFilters;

    this.filterChange.emit(this.selectedFilters);
  }

  get resultsText(): string {
    return `Showing ${this.resultsCount()} of ${this.totalRooms()} results`;
  }
}
