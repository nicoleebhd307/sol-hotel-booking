# Dashboard Receptionist and Manager

## 1) Audit Summary

### High priority gaps identified
- Manager role existed in mock users but no manager dashboard page or route in admin frontend.
- Login always redirected to receptionist dashboard.
- Dashboard APIs were public and had no auth or role checks in backend.
- Frontend stored token but did not attach token to API calls.
- Sidebar menu was not role-aware and contained dead links.
- API base URLs were hardcoded in services.

### Medium priority gaps
- Profile endpoint always returned receptionist profile data.
- No manager summary endpoint.
- Error states were present in code but not consistently represented in UX.

## 2) Implementation Plan (Sequential)

1. Role-based frontend foundation
- Add manager guard.
- Add manager dashboard route.
- Redirect login by role.

2. API and auth plumbing
- Add auth interceptor to attach Bearer token.
- Centralize API base URL config.

3. Backend authorization
- Add middleware `requireAuth` and `requireRole`.
- Protect dashboard endpoints.
- Fix profile endpoint to return token user.

4. Manager dashboard feature
- Add manager dashboard page with manager summary metrics.
- Add manager summary API endpoint.

5. Navigation and UX
- Make sidebar role-aware.
- Wire logout action from sidebar.

## 3) Implemented Changes

### Frontend (hotel-adminFE)
- Added API config:
  - `src/app/config/api.config.ts`
- Added auth interceptor:
  - `src/app/interceptors/auth.interceptor.ts`
- Updated app provider setup with interceptor:
  - `src/app/app.config.ts`
- Added manager route guard:
  - `src/app/services/manager.guard.ts`
- Added manager dashboard page:
  - `src/app/pages/dashboard-manager/dashboard-manager.component.ts`
  - `src/app/pages/dashboard-manager/dashboard-manager.component.html`
  - `src/app/pages/dashboard-manager/dashboard-manager.component.css`
- Added manager route and guard:
  - `src/app/app.routes.ts`
- Updated login role-based redirect:
  - `src/app/pages/login/login.component.ts`
- Updated auth service:
  - use centralized API base URL
  - add `canAccessManagerDashboard()`
  - add `forceLogout()`
  - file: `src/app/services/auth.service.ts`
- Updated dashboard service:
  - use centralized API base URL
  - export shared interfaces
  - add `getManagerSummary()`
  - file: `src/app/services/dashboard.service.ts`
- Updated sidebar:
  - role-aware menu
  - functional logout click handling
  - files:
    - `src/app/components/sidebar/sidebar.component.ts`
    - `src/app/components/sidebar/sidebar.component.html`

### Backend (hotel-bookingBE)
- Added auth middleware:
  - `middleware/auth.middleware.js`
- Protected dashboard routes with auth and role checks:
  - `routes/dashboard.js`
- Added manager summary endpoint:
  - `GET /api/dashboard/manager-summary`
- Updated auth routes:
  - require auth on logout
  - profile now returns current token user
  - file: `routes/auth.js`

## 4) Remaining Follow-up Tasks

- Add comprehensive unit tests for guards, services, and role redirects.
- Add integration tests for role-protected API endpoints.
- Replace mock token format with signed JWT for production-grade security.
- Add environment-based API config for production deployment.
- Expand manager dashboard widgets and reports.

## 5) Quick Manual Validation Checklist

1. Login with receptionist account.
2. Confirm redirect to `/dashboard` and data loads.
3. Login with manager account.
4. Confirm redirect to `/manager-dashboard` and manager summary loads.
5. Call protected APIs without token and confirm 401.
6. Call manager summary with receptionist token and confirm 403.
7. Click sidebar logout and confirm redirect to login.
