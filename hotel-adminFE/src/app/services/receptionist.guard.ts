import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReceptionistGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('Access denied: User not authenticated');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Check if user has receptionist role
    if (!this.authService.hasRole('receptionist')) {
      console.warn('Access denied: User does not have receptionist role');
      this.router.navigate(['/login']);
      return false;
    }

    // User is authenticated and has the right role
    return true;
  }
}
