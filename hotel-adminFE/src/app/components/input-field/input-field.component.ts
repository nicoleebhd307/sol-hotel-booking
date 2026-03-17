import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.css',
})
export class InputFieldComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() icon: string = '';
  @Input() placeholder: string = '';
  @Input() control: AbstractControl | null = null;

  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getInputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  getVisibilityIcon(): string {
    return this.showPassword ? 'visibility_off' : 'visibility';
  }

  /**
   * Cast AbstractControl to FormControl for template binding
   */
  get formControl(): FormControl {
    return this.control as FormControl;
  }
}
