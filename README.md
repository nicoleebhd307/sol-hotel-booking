# Sol An Bang Beach Resort & Spa — Hotel Booking System

A full-stack hotel booking and management system built for **Sol An Bang Beach Resort & Spa**. The project is split into three independent sub-projects: a REST API backend, a customer-facing booking frontend, and a staff admin frontend.

---

## Project Structure

```
sol-hotel-booking/
├── backend/            # Node.js / Express REST API
├── hotel-bookingFE/    # Customer booking app (Angular 21)
└── hotel-adminFE/      # Staff admin panel (Angular 21)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, MongoDB Atlas, Mongoose, JWT |
| Customer FE | Angular 21, Tailwind CSS |
| Admin FE | Angular 21, Tailwind CSS |
| Payment | MoMo ATM / QR gateway |
| Deployment | Backend → Render, Frontends → Vercel |

---

## Sub-projects

### 1. Backend (`/backend`)

REST API server connecting to MongoDB Atlas.

**Base URL (production):** `https://sol-hotel-booking-1.onrender.com`

#### API Routes

| Prefix | Description |
|---|---|
| `GET /health` | Health check |
| `/api/auth` | Login, token management |
| `/api/rooms` | Room & room type CRUD |
| `/api/bookings` | Booking lifecycle |
| `/api/payment` | MoMo payment integration |
| `/api/admin` | Admin staff operations |
| `/api/services` | Hotel services |
| `/api/customers` | Customer records |
| `/api/dashboard` | Manager analytics |

#### Environment Variables

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hotel
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# MoMo Payment
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
MOMO_REDIRECT_URL=...
MOMO_IPN_URL=...
```

#### Run locally

```bash
cd backend
npm install
npm run dev       # development (nodemon)
npm start         # production
```

---

### 2. Customer Booking Frontend (`/hotel-bookingFE`)

Public-facing website for guests to browse rooms and make bookings.

**Production URL:** Deployed on Vercel

#### Features

- Home page with hero, rooms overview, testimonials, news
- Room list & room detail pages
- Multi-step booking creation (phone verification → guest info → payment)
- MoMo QR / ATM card payment flow
- Payment result page
- My Booking search & booking detail
- Cancel booking flow
- Responsive design with mobile hamburger menu

#### Run locally

```bash
cd hotel-bookingFE
npm install
npm start           # ng serve → http://localhost:4200
npm run build       # production build → dist/hotel-bookingFE/browser
```

#### Vercel config (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/hotel-bookingFE/browser",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

### 3. Admin Frontend (`/hotel-adminFE`)

Internal staff panel for receptionists and managers.

**Production URL:** Deployed on Vercel (separate project, root directory = `hotel-adminFE`)

#### Features

- Role-based login (Receptionist / Manager)
- Receptionist dashboard — active bookings, check-in/check-out
- Manager dashboard — revenue analytics, occupancy reports
- Bookings management — create, view, filter, update status
- Rooms management
- Customers list
- Refunds management
- Reports

#### Roles & Guards

| Role | Access |
|---|---|
| Receptionist | Dashboard, Bookings, Rooms, Customers |
| Manager | All receptionist pages + Reports, Refunds |

#### Run locally

```bash
cd hotel-adminFE
npm install
npm start           # ng serve → http://localhost:4200
npm run build       # production build → dist/hotel-adminFE/browser
```

#### API Config

The admin frontend reads backend URL from `src/app/config/api.config.ts`:

```ts
export const API_CONFIG = {
  baseUrl: 'https://sol-hotel-booking-1.onrender.com',
};
```

#### Vercel config (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/hotel-adminFE/browser",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

> **Vercel setup:** In the Vercel project settings for the admin panel, set **Root Directory** to `hotel-adminFE`.

---

## Data Models

| Model | Key Fields |
|---|---|
| `Room` | room_number, room_type_id, floor, status, beach_view |
| `RoomType` | name, description, price, capacity, amenities |
| `Booking` | customer_id, room_id, check_in, check_out, status, total_price |
| `BookingDraft` | temporary booking state before payment |
| `Payment` | booking_id, amount, method, status |
| `Customer` | name, phone, email |
| `Account` | email, password (hashed), role |
| `Staff` | account_id, name, role |
| `Service` | name, description, price |

---

## Deployment

### Backend — Render

1. Connect GitHub repo to Render
2. Set **Root Directory** → `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. Add all environment variables in Render dashboard

### Frontend — Vercel

Deploy each frontend as a **separate Vercel project**:

| Project | Root Directory | Output Directory |
|---|---|---|
| hotel-bookingFE | `hotel-bookingFE` | `dist/hotel-bookingFE/browser` |
| hotel-adminFE | `hotel-adminFE` | `dist/hotel-adminFE/browser` |

Both use `npm run build` as the build command.

---

## Development Notes

- Node.js **≥ 18** required for backend
- npm **10.9.3** specified as package manager for both Angular projects
- MongoDB Atlas free tier (M0) used for database
- MoMo payment supports QR code scan and ATM card (web payment)
- JWT tokens are used for admin authentication; no auth required for customer booking flow
