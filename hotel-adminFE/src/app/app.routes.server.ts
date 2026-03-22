import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Public static page — prerender once
  { path: 'login', renderMode: RenderMode.Prerender },

  // Auth-protected pages: always render on the client.
  // These pages require a valid auth token (stored in localStorage) and live API data,
  // so SSR pre-rendering would produce empty shells and cause hydration mismatches.
  { path: 'dashboard', renderMode: RenderMode.Client },
  { path: 'manager-dashboard', renderMode: RenderMode.Client },
  { path: 'bookings', renderMode: RenderMode.Client },
  { path: 'bookings/new', renderMode: RenderMode.Client },
  { path: 'rooms', renderMode: RenderMode.Client },
  { path: 'customers', renderMode: RenderMode.Client },
  { path: 'refunds', renderMode: RenderMode.Client },
  { path: 'reports', renderMode: RenderMode.Client },
  { path: 'calendar', renderMode: RenderMode.Client },

  // Fallback
  { path: '**', renderMode: RenderMode.Server },
];
