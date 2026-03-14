import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, BedDouble, Layers, Waves } from 'lucide-angular';

export interface PropertyBlock {
  id: number;
  blockNumber: string;
  floors: number;
  suites: number;
  pools: number;
  price: string;
  image: string;
}

@Component({
  selector: 'app-property-block',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './property-block.html',
})
export class PropertyBlockComponent {
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  readonly bedIcon = BedDouble;
  readonly layersIcon = Layers;
  readonly wavesIcon = Waves;

  activeIndex = signal(0);

  blocks: PropertyBlock[] = [
    {
      id: 1,
      blockNumber: 'Block 3',
      floors: 7,
      suites: 12,
      pools: 2,
      price: '$4,200',
      image:
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=2000&q=80',
    },
    {
      id: 2,
      blockNumber: 'Block 5',
      floors: 10,
      suites: 18,
      pools: 3,
      price: '$5,800',
      image:
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80',
    },
    {
      id: 3,
      blockNumber: 'Block 7',
      floors: 5,
      suites: 8,
      pools: 1,
      price: '$3,100',
      image:
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2000&q=80',
    },
  ];

  get current() {
    return this.blocks[this.activeIndex()];
  }

  prev() {
    this.activeIndex.update((i) => (i > 0 ? i - 1 : this.blocks.length - 1));
  }

  next() {
    this.activeIndex.update((i) => (i < this.blocks.length - 1 ? i + 1 : 0));
  }
}
