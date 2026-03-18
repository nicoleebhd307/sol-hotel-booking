import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LogoBrandComponent } from '../../components/logo-brand/logo-brand.component';
import { InputFieldComponent } from '../../components/input-field/input-field.component';
import { ButtonPrimaryComponent } from '../../components/button-primary/button-primary.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LogoBrandComponent,
    InputFieldComponent,
    ButtonPrimaryComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.resolveReturnUrl();
  }

  private resolveReturnUrl(): void {
    const navigation = this.router.getCurrentNavigation();
    const fromNavigation = navigation?.extras?.state?.['returnUrl'];
    const fromHistory = history.state?.returnUrl;

    const candidate = typeof fromNavigation === 'string' ? fromNavigation : fromHistory;
    this.returnUrl = typeof candidate === 'string' && candidate.startsWith('/') ? candidate : null;
  }

  /**
   * Initialize reactive form with validation
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Get email control
   */
  get emailControl() {
    return this.loginForm.get('email');
  }

  /**
   * Get password control
   */
  get passwordControl() {
    return this.loginForm.get('password');
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Reset error message
    this.errorMessage = '';

    // Validate form
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    // Set loading state
    this.isLoading = true;

    // Call auth service
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
          return;
        }
        const destination = response.role === 'manager' ? '/manager-dashboard' : '/dashboard';
        this.router.navigate([destination]);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        // Handle different error types
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if backend is running.';
        } else {
          this.errorMessage = error?.error?.message || 'Login failed. Please try again.';
        }
      },
    });
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Handle Enter key press to submit form
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.loginForm.valid) {
      this.onSubmit();
    }
  }

  /**
   * Navigate to forgot password page
   */
  onForgotPassword(): void {
    // TODO: Implement forgot password navigation
    console.log('Forgot password clicked');
  }
}
