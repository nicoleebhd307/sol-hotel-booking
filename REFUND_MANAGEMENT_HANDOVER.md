# Refund Management Handover

## 1) Scope
This document explains the current Refund Management implementation across backend and frontend, including:
- API endpoints and business rules
- how refund requests are created and processed
- booking status updates after refund processing
- frontend UI guards and loading behavior
- known edge cases and recommended next improvements

## 2) Main Files
Backend:
- `hotel-bookingBE/routes/admin-booking.routes.js`
- `hotel-bookingBE/controllers/admin-booking.controller.js`
- `hotel-bookingBE/services/admin-booking.service.js`
- `hotel-bookingBE/mockData/refunds.js`
- `hotel-bookingBE/mockData/booking.js`

Frontend:
- `hotel-adminFE/src/app/services/admin-booking.service.ts`
- `hotel-adminFE/src/app/pages/refunds/refunds.component.ts`
- `hotel-adminFE/src/app/pages/refunds/refunds.component.html`

## 3) Data Model (Current)
Refund request (mock):
- `id`: request ID
- `bookingId`: booking reference (`BOOKINGS_MOCK._id`)
- `customerName`
- `phone`
- `depositAmount`
- `status`: `pending | confirmed | rejected`
- `createdAt`
- `processedAt`
- `note`

Booking refund info (embedded in booking during processing):
- `booking.refund.status`
- `booking.refund.amount`
- `booking.refund.processedAt`
- `booking.refund.note`

## 4) API Endpoints
Base path: `/api/admin`

- `GET /refunds?status=all|pending|confirmed|rejected`
  - Returns refund requests filtered by status.
- `PATCH /refunds/:bookingId/confirm`
  - Processes a pending refund as confirmed.
- `PATCH /refunds/:bookingId/reject`
  - Processes a pending refund as rejected.

Auth/role:
- All admin routes are protected by `requireAuth` + `requireRole(['manager', 'receptionist'])`.

## 5) End-to-End Refund Flow
### 5.1 Create refund request
Refund requests are created when a booking is cancelled:
- `cancelBooking(bookingId, reason)` sets booking status to `cancelled`
- If `depositAmount > 0`, a pending refund request is created in `REFUND_REQUESTS_MOCK`
- If there is already a pending request for the same booking, no duplicate is created

### 5.2 List refund requests
- Frontend calls `GET /api/admin/refunds?status=...`
- Client-side search filters by request ID, booking ID, phone, customer name

### 5.3 Confirm/Reject refund
Both confirm and reject share the same service core:
- `confirmRefund(...)` and `rejectRefund(...)` call `processRefundRequest(...)`
- Preconditions:
  - booking must exist, else 404 at controller level
  - pending refund request for `bookingId` must exist, else 400 (`Refund request not found`)
  - `depositAmount > 0`, else 400 (`Refund can only be processed when depositAmount > 0`)
- Effects on success:
  - refund request status is updated to `confirmed` or `rejected`
  - `request.note` and `request.processedAt` are set
  - booking status is updated to `cancelled`
  - booking refund object is updated (`booking.refund = { status, amount, processedAt, note }`)

## 6) Frontend UI Behavior
### 6.1 Action enable/disable
In `RefundsComponent`:
- `canProcessRefund(refund)` allows actions only when:
  - `refund.status === 'pending'`
  - `refund.depositAmount > 0`
  - the same row is not already loading
- Confirm/Reject buttons bind to this guard using `[disabled]="!canProcessRefund(refund)"`

### 6.2 Extra runtime guard
Before opening modal and before executing action, frontend re-checks `canProcessRefund` to avoid stale-click race conditions.

### 6.3 Avoid stuck "Processing"
To prevent frozen UI state:
- action request uses `timeout(10000)`
- `finalize(...)` always resets `actionLoadingId`
- updates run inside `NgZone` and trigger `detectChanges()` for deterministic UI updates

## 7) Why "Processing" Could Appear Stuck Earlier
Common reasons:
- row became non-pending on backend but UI still attempted action
- request failed and UI state was not always reset in all paths
- asynchronous UI updates not reflected immediately under hydration/change detection timing

Current implementation addresses this by strict guards + finalize reset + timeout.

## 8) Error Cases You Should Expect
- `401 Unauthorized`: missing/invalid token (interceptor forces logout)
- `403 Forbidden`: user role is not manager/receptionist
- `404 Booking not found`: invalid bookingId
- `400 Refund request not found`: no pending request for booking
- `400 Refund can only be processed when depositAmount > 0`

## 9) Known Product Decision
After confirm/reject refund, booking status is currently set to `cancelled`.
- This is intentional in current code.
- If product later requires `refunded` booking status, update:
  - backend booking status enum normalization and filters
  - frontend booking status type/filter UI
  - any dashboard summary logic dependent on status buckets

## 10) Quick Manual Test Checklist
1. Login as `manager@example.com / manager123` or `receptionist@example.com / receptionist123`.
2. Open Refund Management page.
3. Verify pending request with deposit > 0 has enabled Confirm/Reject.
4. Confirm refund:
   - row transitions from pending to confirmed
   - success toast appears
   - action buttons are disabled afterward
5. Create or mock request with `depositAmount = 0`:
   - Confirm/Reject is disabled in UI
   - API also rejects processing (defense in depth)
6. Retry same booking after already processed:
   - backend returns `Refund request not found`
   - frontend should show error and not remain in processing state

## 11) Suggested Next Improvements
- Add a dedicated booking status `refunded` if business wants post-refund visibility.
- Persist refund requests in database instead of in-memory mock arrays.
- Add automated tests:
  - service unit tests for `processRefundRequest`
  - API integration tests for confirm/reject success and failure cases
  - frontend component tests for button disabled conditions and loading reset
