# Hotel Booking Application - Backend Setup

## API Collections

### 1. room_types Collection
Contains the definition of each room type with amenities, pricing, and capacity information.

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "name": "Scenic Ocean View",
  "area": 45,
  "price_per_night": 650000,
  "bed_options": ["1 double bed", "2 single beds"],
  "capacity": {
    "adults": 2,
    "children": 2
  },
  "description": "Wake up to the rhythmic sounds of waves and a panoramic ocean view of the Pacific.",
  "amenities": [
    "King-size bed",
    "50-inch Smart TV",
    "Air conditioning",
    ...
  ],
  "rate_includes": [
    "Daily breakfast",
    "Welcome drink",
    ...
  ],
  "service_charge": 5,
  "vat": true
}
```

### 2. rooms Collection
Contains individual room instances that reference a room_type.

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "room_number": "301",
  "room_type_id": ObjectId("..."),
  "floor": 3,
  "status": "available",
  "beach_view": true,
  "is_active": true
}
```

## API Endpoints

### Room Types
- `GET /api/room-types` - Get all room types
- `GET /api/room-types/:id` - Get specific room type by ID

### Rooms
- `GET /api/rooms` - Get all rooms with optional filters
  - Query params: `status`, `beach_view`, `is_active`
- `GET /api/rooms/available` - Get only available rooms
- `GET /api/rooms/:id` - Get specific room by ID

### Health Check
- `GET /api/health` - Verify API is running

## Setup Instructions

### Backend

1. Install dependencies:
```bash
cd hotel-bookingBE
npm install
```

2. Start the backend server:
```bash
npm start
# or for development with hot-reload:
npm run dev
```

The API will run on `http://localhost:3000`

### Frontend

1. Install dependencies:
```bash
cd hotel-bookingFE
npm install
```

2. Start the development server:
```bash
ng serve
# or
npx ng serve
```

The frontend will run on `http://localhost:4200`

## API Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 3
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing the API

You can test the API using curl or Postman:

```bash
# Get all available rooms
curl http://localhost:3000/api/rooms/available

# Get available rooms with beach view
curl "http://localhost:3000/api/rooms?status=available&beach_view=true"

# Health check
curl http://localhost:3000/api/health
```

## Notes

- The mock data is stored in JSON files in `hotel-bookingBE/data/`
- Frontend currently uses fallback mock data but has ApiService ready for API integration
- CORS is enabled for frontend communication
