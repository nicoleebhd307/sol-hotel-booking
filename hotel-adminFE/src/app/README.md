# Hotel Dashboard System - Component Architecture

## Project Structure

```
src/app/
├── components/
│   ├── dashboard-card/
│   │   └── dashboard-card.component.ts
│   ├── header-topbar/
│   │   └── header-topbar.component.ts
│   ├── quick-action-card/
│   │   └── quick-action-card.component.ts
│   ├── sidebar/
│   │   └── sidebar.component.ts
│   ├── table-checkins/
│   │   └── table-checkins.component.ts
│   └── table-checkouts/
│       └── table-checkouts.component.ts
├── models/
│   └── dashboard.model.ts
├── pages/
│   └── dashboard-receptionist/
│       ├── dashboard-receptionist.component.ts
│       ├── dashboard-receptionist.component.html
│       └── dashboard-receptionist.component.css
└── services/
    └── dashboard.service.ts
```

## Components Overview

### 1. **Dashboard Card Component** 
`components/dashboard-card/dashboard-card.component.ts`

Displays individual dashboard statistics with trend indicators.

**Input:**
```typescript
@Input() data!: DashboardCardData;

interface DashboardCardData {
  title: string;
  value: number | string;
  percentage: number;
  trend: 'up' | 'down';
  icon?: string;
}
```

**Usage:**
```html
<app-dashboard-card 
  [data]="{ 
    title: 'Total Bookings', 
    value: 24, 
    percentage: 12, 
    trend: 'up' 
  }">
</app-dashboard-card>
```

---

### 2. **Header Topbar Component**
`components/header-topbar/header-topbar.component.ts`

Top navigation bar with search, notifications, settings, and user profile.

**Input:**
```typescript
@Input() userInfo: UserInfo = {
  name: 'Mary Janes',
  role: 'Receptionist',
  profileImage: '/assets/images/admin-profile.png',
};
```

**Usage:**
```html
<app-header-topbar [userInfo]="userInfo"></app-header-topbar>
```

---

### 3. **Quick Action Card Component**
`components/quick-action-card/quick-action-card.component.ts`

Reusable action button component with primary and secondary styling.

**Input:**
```typescript
@Input() data!: ActionCardData;
@Input() isPrimary = false;

interface ActionCardData {
  title: string;
  icon: string;
  isPrimary?: boolean;
}
```

**Usage:**
```html
<app-quick-action-card
  [data]="{ title: 'Create New Booking', icon: '📅' }"
  [isPrimary]="true">
</app-quick-action-card>
```

---

### 4. **Table Check-ins Component**
`components/table-checkins/table-checkins.component.ts`

Displays upcoming guest check-ins with action buttons.

**Input:**
```typescript
@Input() guests: CheckInGuest[] = [];

interface CheckInGuest {
  id: number;
  guestName: string;
  room: string;
  time: string;
  roomType: string;
}
```

**Usage:**
```html
<app-table-checkins [guests]="checkInGuests"></app-table-checkins>
```

---

### 5. **Table Check-outs Component**
`components/table-checkouts/table-checkouts.component.ts`

Displays upcoming guest check-outs with payment status.

**Input:**
```typescript
@Input() guests: CheckOutGuest[] = [];

interface CheckOutGuest {
  id: number;
  guestName: string;
  room: string;
  status: string;
  amount: number;
  checkoutTime: string;
}
```

**Usage:**
```html
<app-table-checkouts [guests]="checkOutGuests"></app-table-checkouts>
```

---

### 6. **Sidebar Component**
`components/sidebar/sidebar.component.ts`

Fixed left navigation sidebar (pre-existing, reused from project).

**Usage:**
```html
<app-sidebar></app-sidebar>
```

---

## Dashboard Page Component

### Dashboard Receptionist Component
`pages/dashboard-receptionist/dashboard-receptionist.component.ts`

Main dashboard page that orchestrates all components and manages data fetching.

#### Key Features:

1. **Lifecycle Management**
   - Implements `OnInit` to load dashboard data
   - Implements `OnDestroy` for proper cleanup with RxJS
   - Uses `takeUntil` pattern to prevent memory leaks

2. **API Integration**
   - Fetches 4 API endpoints:
     - `/api/dashboard/summary` - Dashboard stats
     - `/api/dashboard/checkins` - Check-in guests
     - `/api/dashboard/checkouts` - Check-out guests
     - `/api/dashboard/room-availability` - Room data

3. **Loading States**
   - `isLoadingSummary`, `isLoadingCheckIns`, `isLoadingCheckOuts`, `isLoadingRooms`
   - Disabled UI during data loading
   - Smooth opacity transitions

4. **Error Handling**
   - Fallback data for API failures
   - Error message display
   - Console error logging

#### Data Properties:

```typescript
dashboardStats: DashboardStats[] = [];
checkInGuests: CheckInGuest[] = [];
checkOutGuests: CheckOutGuest[] = [];
roomAvailability: RoomAvailability[] = [];

userInfo = {
  name: 'Mary Janes',
  role: 'receptionist',
  profileImage: 'assets/images/admin-profile.png'
};
```

---

## Service: Dashboard Service

`services/dashboard.service.ts`

Centralized HTTP client service for API communication.

**Methods:**
- `getSummary()` - Fetch dashboard summary stats
- `getCheckIns()` - Fetch check-in guests
- `getCheckOuts()` - Fetch check-out guests  
- `getRoomAvailability()` - Fetch room availability

**Returns:** `Observable<ApiResponse<T>>`

---

## Models

`models/dashboard.model.ts`

Centralized TypeScript interfaces for type safety.

```typescript
interface DashboardStats { ... }
interface CheckInGuest { ... }
interface CheckOutGuest { ... }
interface RoomAvailability { ... }
interface DashboardSummary { ... }
interface ApiResponse<T> { ... }
interface UserInfo { ... }
```

---

## Styling Architecture

### TailwindCSS + Custom Colors

All components use TailwindCSS utilities with custom color palette:

- **Primary Gold**: `#775a19`, `#c5a059`
- **Neutral Dark**: `#1d1c13`, `#4e4639`
- **Background**: `#fcfaf1`, `#f3eedf`
- **Text**: `#1d1c13` (headings), `#4e4639` (body)
- **Accent**: `#00687b` (teal), `#ba1a1a` (red)

### Typography

- **Headings**: Playfair Display (serif)
- **UI Text**: Plus Jakarta Sans (sans-serif)

### Components CSS Priority

1. **TailwindCSS** - Utility classes in templates
2. **Component CSS** - Minimal enhancements
3. **Inline Styles** - Font families (as fallback)

---

## Usage Example

### Main Dashboard Implementation

```typescript
// dashboard-receptionist.component.ts
export class DashboardReceptionistComponent implements OnInit, OnDestroy {
  dashboardStats: DashboardStats[] = [];
  checkInGuests: CheckInGuest[] = [];
  checkOutGuests: CheckOutGuest[] = [];
  roomAvailability: RoomAvailability[] = [];
  
  userInfo = { name: 'Mary Janes', role: 'receptionist', profileImage: '...' };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loadSummary();
    this.loadCheckIns();
    this.loadCheckOuts();
    this.loadRoomAvailability();
  }
  
  // ... more methods
}
```

### Template Usage

```html
<div class="flex bg-[#fcfaf1] min-h-screen">
  <app-sidebar></app-sidebar>
  
  <div class="flex-1 ml-[260px]">
    <app-header-topbar [userInfo]="userInfo"></app-header-topbar>
    
    <!-- Summary Cards -->
    <div class="grid grid-cols-4 gap-6">
      <app-dashboard-card *ngFor="let stat of dashboardStats" [data]="stat"></app-dashboard-card>
    </div>
    
    <!-- Tables -->
    <div class="grid grid-cols-2 gap-8">
      <app-table-checkins [guests]="checkInGuests"></app-table-checkins>
      <app-table-checkouts [guests]="checkOutGuests"></app-table-checkouts>
    </div>
  </div>
</div>
```

---

## API Integration

### Backend Endpoints

```
GET /api/dashboard/summary
Response: { success: true, data: { totalBookingsToday, checkIn, checkOut, availableRooms, stats } }

GET /api/dashboard/checkins
Response: { success: true, data: [{ id, guestName, room, time, roomType }, ...] }

GET /api/dashboard/checkouts
Response: { success: true, data: [{ id, guestName, room, status, amount, checkoutTime }, ...] }

GET /api/dashboard/room-availability
Response: { success: true, data: [{ roomType, available, total, percentage }, ...] }
```

---

## Best Practices Implemented

✅ **Standalone Components** - All components are Angular standalone (no NgModules)

✅ **Type Safety** - Full TypeScript interfaces for all data structures

✅ **Reusability** - Components use `@Input()` for data binding

✅ **Performance** - RxJS `takeUntil` pattern prevents memory leaks

✅ **Error Handling** - Fallback data and error messages

✅ **Styling** - TailwindCSS + semantic HTML structure

✅ **Separation of Concerns** - Service layer, models, components, pages

✅ **Responsive Design** - Grid layouts adapt to different screen sizes

✅ **Accessibility** - Semantic HTML, proper ARIA attributes

---

## Future Enhancements

- [ ] Add pagination to tables
- [ ] Implement real-time updates with WebSocket
- [ ] Add data export functionality
- [ ] Implement advanced filtering
- [ ] Add dashboard customization (create/edit views)
- [ ] Implement role-based access control
- [ ] Add sweet alerts for actions
- [ ] Integrate with authentication service

