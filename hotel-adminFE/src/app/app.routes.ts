import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardReceptionistComponent } from './pages/dashboard-receptionist/dashboard-receptionist.component';
import { DashboardManagerComponent } from './pages/dashboard-manager/dashboard-manager.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { CreateBookingComponent } from './pages/bookings/create-booking/create-booking.component';
import { FeaturePlaceholderComponent } from './pages/feature-placeholder/feature-placeholder.component';
import { AuthenticatedGuard } from './services/authenticated.guard';
import { ReceptionistGuard } from './services/receptionist.guard';
import { ManagerGuard } from './services/manager.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardReceptionistComponent,
    canActivate: [ReceptionistGuard],
  },
  {
    path: 'manager-dashboard',
    component: DashboardManagerComponent,
    canActivate: [ManagerGuard],
  },
  {
    path: 'bookings',
    component: BookingsComponent,
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'bookings/new',
    component: CreateBookingComponent,
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'rooms',
    component: FeaturePlaceholderComponent,
    canActivate: [AuthenticatedGuard],
    data: { title: 'Rooms' },
  },
  {
    path: 'calendar',
    component: FeaturePlaceholderComponent,
    canActivate: [AuthenticatedGuard],
    data: { title: 'Room Calendar' },
  },
  {
    path: 'customers',
    component: FeaturePlaceholderComponent,
    canActivate: [AuthenticatedGuard],
    data: { title: 'Customers' },
  },
  {
    path: 'reports',
    component: FeaturePlaceholderComponent,
    canActivate: [AuthenticatedGuard],
    data: { title: 'Reports' },
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
