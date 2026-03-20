# Admin Booking Panel MVP

## Scope
- This admin panel is for a booking platform.
- Included: booking management and refund management.
- Excluded: hotel operations (no check-in/check-out workflows, no room CRUD).

## Sample Schema

### Booking
```json
{
  "bookingId": "AZ-1234",
  "customerName": "Elena Rodriguez",
  "phone": "+34 600 123 456",
  "roomType": "Ocean Suite",
  "checkInDate": "2026-03-12",
  "checkOutDate": "2026-03-19",
  "status": "pending",
  "totalAmount": 840,
  "depositAmount": 200,
  "createdAt": "2026-03-01",
  "extraServices": [
    { "name": "Breakfast", "amount": 20, "createdAt": "2026-03-02T10:00:00.000Z" }
  ],
  "cancellation": {
    "requested": false,
    "reason": "",
    "requestedAt": "",
    "approvedAt": ""
  },
  "refund": {
    "status": "none",
    "amount": 0,
    "processedAt": "",
    "note": ""
  }
}
```

### Refund Request
```json
{
  "id": "RR-171223344",
  "bookingId": "AZ-1234",
  "customerName": "Elena Rodriguez",
  "phone": "+34 600 123 456",
  "depositAmount": 200,
  "status": "pending",
  "createdAt": "2026-03-05T08:30:00.000Z",
  "processedAt": "",
  "note": ""
}
```

## REST API Endpoints
Base path: `/api/admin`

### Dashboard + Booking List
- `GET /bookings?status=pending|confirmed|cancelled|all&date=YYYY-MM-DD&search=phone_or_bookingId`
- Response includes:
  - `data`: booking list
  - `summary`: `{ totalBookings, totalRevenue, totalDeposits }`

### Booking Detail
- `GET /bookings/:bookingId`

### Update Booking Basic Info
- `PATCH /bookings/:bookingId`
- Body supports:
  - `customerName`
  - `phone`
  - `roomType`
  - `checkInDate`
  - `checkOutDate`
  - `depositAmount`

### Update Booking Status
- `PATCH /bookings/:bookingId/status`
- Body:
```json
{ "status": "confirmed" }
```

### Add Extra Services
- `PATCH /bookings/:bookingId/services`
- Body:
```json
{
  "services": [
    { "name": "Breakfast", "amount": 20 },
    { "name": "Laundry", "amount": 15 }
  ]
}
```

### Logical Delete (Cancel Booking)
- `DELETE /bookings/:bookingId`
- Body (optional):
```json
{ "reason": "Customer requested cancellation" }
```

### Refund Management
- `GET /refunds?status=pending|confirmed|rejected|all`
- `PATCH /refunds/:bookingId/confirm`
- `PATCH /refunds/:bookingId/reject`

## Example UI Structure (Admin FE)

### 1) Dashboard / Booking List Page
- Top bar:
  - Search input (booking ID or phone)
  - Status filter
  - Date filter
- KPI cards:
  - Total bookings
  - Total revenue
- Booking table columns:
  - Booking ID
  - Customer
  - Phone
  - Room Type
  - Check-in / Check-out
  - Status
  - Total / Deposit
  - Actions (View, Edit, Cancel)

### 2) Booking Detail Drawer/Modal
- Read-only core fields
- Editable fields:
  - customerName
  - phone
  - roomType
  - checkInDate/checkOutDate
- Extra services section:
  - add service name + amount
  - auto-update total amount
- Status action:
  - pending -> confirmed
  - cancel booking

### 3) Refund Management Page
- Refund requests table:
  - Booking ID
  - Customer
  - Phone
  - Deposit amount
  - Request status
  - Created at
  - Actions: Confirm / Reject

## Notes
- Admin cannot create booking in this module.
- Room is treated as `roomType` string only.
- Business logic is separated in backend:
  - `models/admin-booking.model.js`
  - `services/admin-booking.service.js`
  - `controllers/admin-booking.controller.js`
  - `routes/admin-booking.routes.js`
