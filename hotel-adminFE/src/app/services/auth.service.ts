import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: 'receptionist' | 'manager' | 'admin';
  name: string;
  profileImage: string;
  token?: string;
}

interface BackendLoginResponse {
  token: string;
  account: {
    id: string;
    role: 'receptionist' | 'manager' | 'admin';
    name: string;
    email?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'authUser';
  private readonly apiUrl = `${API_CONFIG.baseUrl}/api/admin`;
  private readonly platformId = inject(PLATFORM_ID);
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Login with backend API
   */
  login(credentials: LoginRequest): Observable<User> {
    const payload = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    };

    return this.http.post<BackendLoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      map((response) => {
        return {
          id: response.account.id,
          email: response.account.email || '',
          role: response.account.role,
          name: response.account.name,
          profileImage:
            response.account.role === 'manager' || response.account.role === 'admin'
              ? 'assets/images/manager-profile.png'
              : 'assets/images/admin-profile.png',
          token: response.token,
        } as User;
      }),
      tap((user) => {
        this.saveToken(user.token || '');
        this.saveUser(user);
        this.currentUserSubject.next(user);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<{ success: boolean }> {
    this.clearAuth();
    return of({ success: true });
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
    const user = this.currentUserSubject.value;
    return user?.role === 'manager' || user?.role === 'admin';
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
