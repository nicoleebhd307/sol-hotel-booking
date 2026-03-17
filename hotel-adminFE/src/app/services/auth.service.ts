import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  role: 'receptionist' | 'manager';
  name: string;
  profileImage: string;
  token?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'authUser';
  private readonly apiUrl = `${API_CONFIG.baseUrl}/api/auth`;
  private readonly platformId = inject(PLATFORM_ID);
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Login with backend API
   */
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          const user = response.data;
          this.saveToken(user.token || '');
          this.saveUser(user);
          this.currentUserSubject.next(user);
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
      })
    );
  }

  /**
   * Save authentication token to localStorage
   */
  private saveToken(token: string): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Save user data to localStorage
   */
  private saveUser(user: User): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored user data from localStorage
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser()) {
      return null;
    }

    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: 'receptionist' | 'manager'): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  /**
   * Check if user can access receptionist dashboard
   */
  canAccessReceptionistDashboard(): boolean {
    return this.hasRole('receptionist');
  }

  /**
   * Check if user can access manager dashboard
   */
  canAccessManagerDashboard(): boolean {
    return this.hasRole('manager');
  }

  /**
   * Force local logout without waiting for API call
   */
  forceLogout(): void {
    this.clearAuth();
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
