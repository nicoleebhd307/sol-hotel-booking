# Hotel Booking Backend

Node.js + Express + MongoDB Atlas (Mongoose) backend supporting room search, booking creation, deposit payment, cancellation/refunds, and admin management.

## Quick start

1. **MongoDB Atlas Network Access**
   - In Atlas: **Security → Network Access → Add IP Address**
   - Add **your current public IP** (recommended), or for quick dev use `0.0.0.0/0` (not recommended for production).

2. **Configure env**
   - Copy `.env.example` → `.env` and set:
     - `MONGODB_URI`
     - `JWT_SECRET`

3. **Install + run**

```bash
cd backend
npm install
npm run seed
npm run dev
```

Health check:

```bash
curl http://localhost:5000/health
```

## API overview

Base URL: `/api`

### Guest / Customer

- `GET /rooms/types`
- `GET /rooms` (optional `?roomTypeId=...`)
- `GET /rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&roomTypeId=...`

- `POST /bookings`
  - Body:
    ```json
    {
      "customer": {"name":"Jane","email":"jane@example.com","phone":"..."},
      "roomIds": ["<roomObjectId>"],
      "check_in": "2026-04-01",
      "check_out": "2026-04-05",
      "guests": {"adults": 2, "children": 0},
      "note": "Late arrival"
    }
    ```
  - Creates booking with `status=pending` and a 30 minute hold.

- `GET /bookings/:id?email=jane@example.com`
  - Simple guest lookup guard by customer email.

- `POST /bookings/:id/cancel`
  - Body: `{ "email": "jane@example.com" }`

### Payments

- `POST /payments/deposit`
  - Body:
    ```json
    { "bookingId": "<bookingId>", "paymentMethod": "card", "simulateStatus": "success" }
    ```
  - `simulateStatus` is only for the stub gateway (`PAYMENT_GATEWAY_MODE=stub`).

### Admin / Staff

- `POST /admin/login`
  - Body: `{ "username": "admin", "password": "..." }`
  - Returns JWT token (Bearer).

- `GET /admin/bookings`
- `GET /admin/bookings/:id`
- `POST /admin/bookings` (manual booking; manager/admin)
- `POST /admin/bookings/:id/cancel`
- `POST /admin/bookings/:id/check-in`
- `POST /admin/bookings/:id/check-out`
- `PATCH /admin/bookings/:id/extra-charges`
- `PATCH /admin/bookings/:id/note`

- `GET /admin/rooms/calendar?roomId=<roomId>&from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /admin/stats/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD`

## Notes

- Pending bookings are auto-cancelled after `BOOKING_HOLD_MINUTES`.
- Availability excludes cancelled bookings and respects pending holds.
- Refund policy is controlled by env vars:
  - `CANCEL_REFUND_BEFORE_DAYS`, `CANCEL_NO_REFUND_WITHIN_DAYS`, `CANCEL_REFUND_PERCENT`
