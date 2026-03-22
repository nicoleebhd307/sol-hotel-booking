import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-primary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-primary.component.html',
  styleUrl: './button-primary.component.css',
})
export class ButtonPrimaryComponent {
  @Input() text: string = 'Button';
  @Input() isLoading: boolean = false;
  @Input() isDisabled: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.isDisabled && !this.isLoading) {
      this.clicked.emit();
    }
  }
}
