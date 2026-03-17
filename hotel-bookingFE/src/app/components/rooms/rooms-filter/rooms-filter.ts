import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FilterOption {
  label: string;
  key: string;
  options: string[];
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
      options: ['Deluxe Room', 'Suite', 'Penthouse']
    },
    {
      key: 'priceRange',
      label: 'Price Range',
      options: ['$0 - $500', '$500 - $1000', '$1000+']
    },
    {
      key: 'guests',
      label: 'Guests',
      options: ['1 Guest', '2 Guests', '3-4 Guests', '5+ Guests']
    },
    {
      key: 'view',
      label: 'View',
      options: ['Ocean Front', 'Garden View', 'City View']
    }
  ];

  selectedFilters: Map<string, string> = new Map();
  resultsText = 'Showing 12 of 48 results';

  onFilterChange(key: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    if (value) {
      this.selectedFilters.set(key, value);
    } else {
      this.selectedFilters.delete(key);
    }
  }
}
