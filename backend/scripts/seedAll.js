/**
 * seedAll.js — Clear all collections and re-seed with realistic test data.
 * Usage: node scripts/seedAll.js
 *
 * Collections affected (schemas/indexes are KEPT, only documents cleared):
 *   accounts, staffs, customers, room_types, rooms, services,
 *   bookings, payments, booking_drafts
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Account      = require('../models/Account');
const Staff        = require('../models/Staff');
const Customer     = require('../models/Customer');
const RoomType     = require('../models/RoomType');
const Room         = require('../models/Room');
const Service      = require('../models/Service');
const Booking      = require('../models/Booking');
const Payment      = require('../models/Payment');
const BookingDraft = require('../models/BookingDraft');

// ─── helpers ────────────────────────────────────────────────────────────────
const days = (n, base = new Date()) => new Date(base.getTime() + n * 86400_000);

// ─── 1. ACCOUNTS & STAFF ────────────────────────────────────────────────────
// All passwords: 123456 (plaintext for dev seed)
const accountSeed = [
  { email: 'admin@hotel.com',      password: '123456', role: 'admin',        name: 'Admin User',       phone: '0901000001' },
  { email: 'manager@hotel.com',    password: '123456', role: 'manager',      name: 'Bui Hoang Dieu',    phone: '0901000002' },
  { email: 'reception1@hotel.com', password: '123456', role: 'receptionist', name: 'Tran Khanh Linh', phone: '0901000003' },
  { email: 'reception2@hotel.com', password: '123456', role: 'receptionist', name: 'Phung Kim Chau', phone: '0901000004' },
];

// ─── 2. ROOM TYPES ──────────────────────────────────────────────────────────
// 4 Deluxe variants + 1 Superior Room (suite tier)
const roomTypeSeed = [
  {
    name: 'Deluxe Street View',
    area: 36,
    price_per_night: 1_100_000,
    bed_options: ['1 King bed', '2 Twin beds'],
    capacity: { adults: 2, children: 1 },
    view: 'street',
    description: 'Modern Deluxe room with street view, fully equipped with contemporary amenities.',
    amenities: ['Wi-Fi', 'Smart TV', 'Air conditioning', 'Minibar', 'Safe', 'Walk-in shower'],
    rate_includes: ['Breakfast', 'Complimentary water'],
    service_charge: 5,
    vat: 10,
    image: [],
    images: ["https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Deluxe-Streetview-Double-5.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Deluxe-Streetview-Double-7-scaled.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Deluxe-Streetview-Double-3.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Deluxe-Streetview1.jpg",
        
    ],
  },
  {
    name: 'Deluxe Sea View',
    area: 36,
    price_per_night: 1_600_000,
    bed_options: ['1 King bed'],
    capacity: { adults: 2, children: 1 },
    view: 'sea',
    description: 'Deluxe room with private balcony overlooking the ocean. Ideal for a relaxing coastal stay.',
    amenities: ['Wi-Fi', 'Smart TV', 'Air conditioning', 'Minibar', 'Safe', 'Bathtub', 'Private balcony'],
    rate_includes: ['Breakfast', 'Welcome fruit', 'Complimentary water'],
    service_charge: 5,
    vat: 10,
    image: ["https://solanbang.com/wp-content/uploads/2025/05/Deluxe-Streetview2.jpg"],
    images: [        "https://solanbang.com/wp-content/uploads/2025/05/Deluxe-Streetview1.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Deluxe-Streetview-Double-5.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Deluxe-Streetview-Double-7-scaled.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Room-View-to-Balcony.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Room-Deluxe-Forestview-Twin.jpg"
    ],
  },
  {
    name: 'Deluxe Forest View',
    area: 36,
    price_per_night: 1_350_000,
    bed_options: ['1 King bed', '2 Twin beds'],
    capacity: { adults: 2, children: 1 },
    view: 'forest',
    description: 'Peaceful Deluxe room surrounded by lush tropical greenery. Perfect for nature lovers.',
    amenities: ['Wi-Fi', 'Smart TV', 'Air conditioning', 'Minibar', 'Safe', 'Walk-in shower', 'Private balcony'],
    rate_includes: ['Breakfast', 'Complimentary water'],
    service_charge: 5,
    vat: 10,
    image: ["https://solanbang.com/wp-content/uploads/2025/05/Superior-room3.jpg"],
    images: ["https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Room-Deluxe-Forestview-Twin.jpg",
        "https://solanbang.com/wp-content/uploads/2025/03/Sol-An-Bang-_-Restaurant-_-Outdoor-Area.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/A745454.jpg",

    ],
  },
  {
    name: 'Deluxe Garden View',
    area: 36,
    price_per_night: 1_200_000,
    bed_options: ['1 King bed', '2 Twin beds'],
    capacity: { adults: 2, children: 1 },
    view: 'garden',
    description: 'Deluxe room with a serene garden view, offering a calm and refreshing atmosphere.',
    amenities: ['Wi-Fi', 'Smart TV', 'Air conditioning', 'Minibar', 'Safe', 'Walk-in shower'],
    rate_includes: ['Breakfast', 'Complimentary water'],
    service_charge: 5,
    vat: 10,
    image: [],
    images: ["https://solanbang.com/wp-content/uploads/2025/05/Deluxe-Streetview2.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Deluxe-Streetview-Double-5.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Deluxe-Streetview-Double-6-scaled.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Deluxe-Streetview-Double-7-scaled.jpg",

    ],
  },
  {
    name: 'Superior Room',
    area: 65,
    price_per_night: 2_800_000,
    bed_options: ['1 King bed'],
    capacity: { adults: 3, children: 2 },
    view: 'sea',
    description: 'Luxurious Superior Room with panoramic sea view, separate living area, Jacuzzi bathtub, and dedicated personal butler service.',
    amenities: ['Wi-Fi', '65" Smart TV', 'Air conditioning', 'Premium minibar', 'Safe', 'Jacuzzi bathtub', 'Rain shower', 'Private balcony', 'Nespresso machine', 'Personal butler'],
    rate_includes: ['Breakfast', 'Dinner', 'Welcome fruit & wine', 'Complimentary water', 'Airport transfer', 'Daily spa session'],
    service_charge: 5,
    vat: 10,
    image: ["https://solanbang.com/wp-content/uploads/2025/05/Superior-room4.jpg"],
    images: ["https://solanbang.com/wp-content/uploads/2025/05/Deluxe-Streetview1.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Superior-room3.jpg",
        "https://solanbang.com/wp-content/uploads/2025/04/Superior-room2.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/A745454.jpg",
        "https://solanbang.com/wp-content/uploads/2025/05/Sol-An-Bang-_-Room-Deluxe-Forestview-Twin.jpg"
    ],
  },
];

// ─── 3. SERVICES ────────────────────────────────────────────────────────────
const serviceSeed = [
  { title: 'Airport Transfer',  imageUrl: 'https://onevivu.vn/wp-content/uploads/2022/05/Thue-xe-Ha-Long-3.jpg' },
  { title: 'Spa & Massage',     imageUrl: 'https://solanbang.com/wp-content/uploads/2025/05/Sol-Spa-Gym-7.jpg' },
  { title: 'Restaurant',        imageUrl: 'https://solanbang.com/wp-content/uploads/2025/05/b82644506bedcbb392fc40.jpg' },
  { title: 'Swimming Pool',     imageUrl: 'https://solanbang.com/wp-content/uploads/2025/03/Sol-An-Bang-_-Swimming-Pool-1.jpg' },
  { title: 'Fitness Center',    imageUrl: 'https://bwarch.bm/wp-content/uploads/2022/08/Fitness-4.jpg' },
  { title: 'Car Rental',        imageUrl: '/assets/images/services/car.jpg' },
  { title: 'Laundry Service',   imageUrl: '/assets/images/services/laundry.jpg' },
  { title: 'Conference Room',   imageUrl: '/assets/images/services/conference.jpg' },
  { title: 'Breakfast',      imageUrl: 'https://solanbang.com/wp-content/uploads/2025/03/Sol-An-Bang-_-Array-of-Breakfast-Options-1.jpg' },
  { title: 'Basket Boat',         imageUrl: 'https://solanbang.com/wp-content/uploads/2025/05/hoi-an-basket-boat-family.jpg' },
];

// ─── 4. CUSTOMERS ────────────────────────────────────────────────────────────
// Customer names/info kept as-is (Vietnamese + foreign guests)
const customerSeed = [
  { name: 'Nguyễn Văn Hùng',  email: 'hung.nguyen@gmail.com',    phone: '0912345601', identityId: '045091023401' },
  { name: 'Trần Thị Mai',      email: 'mai.tran@gmail.com',       phone: '0912345602', identityId: '045091023402' },
  { name: 'Lê Minh Tuấn',      email: 'tuan.le@gmail.com',        phone: '0912345603',  identityId: '045091023403' },
  { name: 'Phạm Thị Lan',      email: 'lan.pham@gmail.com',       phone: '0912345604',  identityId: '045091023404' },
  { name: 'Hoàng Văn Nam',     email: 'nam.hoang@gmail.com',      phone: '0912345605',  identityId: '045091023405' },
  { name: 'Đặng Thị Hoa',      email: 'hoa.dang@gmail.com',       phone: '0912345606', identityId: '045091023406' },
  { name: 'John Smith',        email: 'john.smith@email.com',     phone: '+14155550101',     identityId: 'P012345678' },
  { name: 'Emma Johnson',      email: 'emma.j@email.com',         phone: '+441632960101',    identityId: 'P023456789' },
  { name: 'Tanaka Hiroshi',    email: 'hiroshi.t@email.com',      phone: '+819012345678',   identityId: 'JP98765432' },
  { name: 'Kim Min-jun',       email: 'minjun.kim@email.com',     phone: '+821098765432',     identityId: 'KR12345678' },
  { name: 'Võ Thị Bích',       email: 'bich.vo@gmail.com',        phone: '0912345611',  identityId: '045091023411' },
  { name: 'Ngô Đức Thành',     email: 'thanh.ngo@gmail.com',      phone: '0912345612',  identityId: '045091023412' },
];

// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'BookingRoom' });
  console.log('Connected\n');

  // ── STEP 1: Clear all collections ────────────────────────────────────────
  console.log('Clearing all collections...');
  await Promise.all([
    Account.deleteMany({}),
    Staff.deleteMany({}),
    Customer.deleteMany({}),
    RoomType.deleteMany({}),
    Room.deleteMany({}),
    Service.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    BookingDraft.deleteMany({}),
  ]);
  console.log('All collections cleared\n');

  // ── STEP 2: Seed Accounts & Staff ────────────────────────────────────────
  console.log('Seeding accounts & staff...');
  const staffDocs = [];
  for (const seed of accountSeed) {
    const acc = await Account.create({
      email:    seed.email,
      password: seed.password,
      status:   'active',
    });
    const staff = await Staff.create({
      account_id: String(acc._id),
      role:  seed.role,
      name:  seed.name,
      phone: seed.phone,
      email: seed.email,
    });
    staffDocs.push(staff);
    console.log(`  [${seed.role}] ${seed.email}`);
  }

  // ── STEP 3: Seed Room Types ──────────────────────────────────────────────
  console.log('\nSeeding room types...');
  const createdRoomTypes = await RoomType.insertMany(roomTypeSeed);
  const rtMap = {};
  createdRoomTypes.forEach(rt => { rtMap[rt.name] = rt; });
  console.log(`  ${createdRoomTypes.length} room types inserted`);

  // ── STEP 4: Seed Rooms ───────────────────────────────────────────────────
  console.log('\nSeeding rooms...');
  // Floor layout:
  //   Floor 1 — Deluxe Street View : 101-105
  //   Floor 2 — Deluxe Garden View : 201-205
  //   Floor 3 — Deluxe Forest View : 301-305
  //   Floor 4 — Deluxe Sea View    : 401-405
  //   Floor 5 — Superior Room      : 501-503
  const roomSeed = [
    // Deluxe Street View — floor 1
    { room_number: '101', room_type_id: rtMap['Deluxe Street View']._id, floor: 1, status: 'available' },
    { room_number: '102', room_type_id: rtMap['Deluxe Street View']._id, floor: 1, status: 'available' },
    { room_number: '103', room_type_id: rtMap['Deluxe Street View']._id, floor: 1, status: 'maintenance' },
    { room_number: '104', room_type_id: rtMap['Deluxe Street View']._id, floor: 1, status: 'available' },
    { room_number: '105', room_type_id: rtMap['Deluxe Street View']._id, floor: 1, status: 'available' },
    // Deluxe Garden View — floor 2
    { room_number: '201', room_type_id: rtMap['Deluxe Garden View']._id, floor: 2, status: 'available' },
    { room_number: '202', room_type_id: rtMap['Deluxe Garden View']._id, floor: 2, status: 'available' },
    { room_number: '203', room_type_id: rtMap['Deluxe Garden View']._id, floor: 2, status: 'occupied' },
    { room_number: '204', room_type_id: rtMap['Deluxe Garden View']._id, floor: 2, status: 'available' },
    { room_number: '205', room_type_id: rtMap['Deluxe Garden View']._id, floor: 2, status: 'available' },
    // Deluxe Forest View — floor 3
    { room_number: '301', room_type_id: rtMap['Deluxe Forest View']._id, floor: 3, status: 'available' },
    { room_number: '302', room_type_id: rtMap['Deluxe Forest View']._id, floor: 3, status: 'available' },
    { room_number: '303', room_type_id: rtMap['Deluxe Forest View']._id, floor: 3, status: 'occupied'},
    { room_number: '304', room_type_id: rtMap['Deluxe Forest View']._id, floor: 3, status: 'available' },
    { room_number: '305', room_type_id: rtMap['Deluxe Forest View']._id, floor: 3, status: 'available' },
    // Deluxe Sea View — floor 4
    { room_number: '401', room_type_id: rtMap['Deluxe Sea View']._id,    floor: 4, status: 'available'  },
    { room_number: '402', room_type_id: rtMap['Deluxe Sea View']._id,    floor: 4, status: 'available'  },
    { room_number: '403', room_type_id: rtMap['Deluxe Sea View']._id,    floor: 4, status: 'occupied'},
    { room_number: '404', room_type_id: rtMap['Deluxe Sea View']._id,    floor: 4, status: 'available'  },
    { room_number: '405', room_type_id: rtMap['Deluxe Sea View']._id,    floor: 4, status: 'available'  },
    // Superior Room — floor 5
    { room_number: '501', room_type_id: rtMap['Superior Room']._id,      floor: 5, status: 'available'  },
    { room_number: '502', room_type_id: rtMap['Superior Room']._id,      floor: 5, status: 'occupied'},
    { room_number: '503', room_type_id: rtMap['Superior Room']._id,      floor: 5, status: 'available'  },
  ];
  const createdRooms = await Room.insertMany(roomSeed);
  const roomByNum = {};
  createdRooms.forEach(r => { roomByNum[r.room_number] = r; });
  console.log(`  ${createdRooms.length} rooms inserted`);

  // ── STEP 5: Seed Services ────────────────────────────────────────────────
  console.log('\nSeeding services...');
  await Service.insertMany(serviceSeed);
  console.log(`  ${serviceSeed.length} services inserted`);

  // ── STEP 6: Seed Customers ───────────────────────────────────────────────
  console.log('\nSeeding customers...');
  const createdCustomers = await Customer.insertMany(customerSeed);
  console.log(`  ${createdCustomers.length} customers inserted`);

  // ── STEP 7: Seed Bookings & Payments ────────────────────────────────────
  console.log('\nSeeding bookings & payments...');

  const now = new Date();

  const priceOf = (room) => {
    const rt = createdRoomTypes.find(r => String(r._id) === String(room.room_type_id));
    return rt ? rt.price_per_night : 1_100_000;
  };

  async function makeBooking({
    customer, rooms, checkInOffset, nights,
    status, paymentStatus = 'success', note = '',
    extraServices = [], extraCharge = 0,
  }) {
    const checkIn  = days(checkInOffset);
    const checkOut = days(checkInOffset + nights);
    const roomDocs = rooms.map(r => ({
      room_id: r._id,
      price_per_night: priceOf(r),
    }));
    const baseTotal     = roomDocs.reduce((s, r) => s + r.price_per_night * nights, 0);
    const totalPrice    = Math.round(baseTotal * 1.15 + extraCharge); // +15% tax & service
    const depositAmount = Math.round(totalPrice * 0.3);

    const booking = await Booking.create({
      customer_id:   customer._id,
      rooms:         roomDocs,
      check_in:      checkIn,
      check_out:     checkOut,
      guests:        { adults: 2, children: 0 },
      totalPrice,
      depositAmount,
      extraCharge,
      extraServices,
      status,
      note,
      refund_status: 'none',
      createdAt:     days(checkInOffset - 5),
    });

    if (paymentStatus !== 'none') {
      await Payment.create({
        bookingId:     booking._id,
        amount:        depositAmount,
        paymentMethod: ['cash', 'card', 'bank_transfer'][Math.floor(Math.random() * 3)],
        paymentStatus,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        createdAt:     days(checkInOffset - 4),
      });
    }
    return booking;
  }

  // confirmed — upcoming (next 5-20 days)
  await makeBooking({ customer: createdCustomers[0],  rooms: [roomByNum['101']], checkInOffset: 5,  nights: 3, status: 'confirmed' });
  await makeBooking({ customer: createdCustomers[1],  rooms: [roomByNum['201']], checkInOffset: 7,  nights: 2, status: 'confirmed' });
  await makeBooking({ customer: createdCustomers[6],  rooms: [roomByNum['401']], checkInOffset: 10, nights: 4, status: 'confirmed' });
  await makeBooking({ customer: createdCustomers[7],  rooms: [roomByNum['501']], checkInOffset: 12, nights: 5, status: 'confirmed', note: 'Honeymoon package - Superior Room' });
  await makeBooking({ customer: createdCustomers[9],  rooms: [roomByNum['301']], checkInOffset: 15, nights: 3, status: 'confirmed' });
  await makeBooking({ customer: createdCustomers[10], rooms: [roomByNum['402']], checkInOffset: 8,  nights: 2, status: 'confirmed' });

  // checked_in — currently staying
  await makeBooking({ customer: createdCustomers[2], rooms: [roomByNum['203']], checkInOffset: -1, nights: 4, status: 'checked_in' });
  await makeBooking({ customer: createdCustomers[3], rooms: [roomByNum['303']], checkInOffset: -2, nights: 5, status: 'checked_in', extraServices: [{ name: 'Spa & Massage', amount: 300_000 }], extraCharge: 300_000 });
  await makeBooking({ customer: createdCustomers[8], rooms: [roomByNum['403']], checkInOffset: 0,  nights: 3, status: 'checked_in', extraServices: [{ name: 'Minibar', amount: 150_000 }], extraCharge: 150_000 });
  await makeBooking({ customer: createdCustomers[4], rooms: [roomByNum['502']], checkInOffset: -3, nights: 7, status: 'checked_in', note: 'VIP guest — butler service requested' });
  await makeBooking({ customer: createdCustomers[11],rooms: [roomByNum['102']], checkInOffset: -1, nights: 2, status: 'checked_in' });

  // checked_out — recently departed (last 1-12 days)
  await makeBooking({ customer: createdCustomers[5],  rooms: [roomByNum['104']], checkInOffset: -8,  nights: 3, status: 'checked_out' });
  await makeBooking({ customer: createdCustomers[10], rooms: [roomByNum['302']], checkInOffset: -10, nights: 2, status: 'checked_out' });
  await makeBooking({ customer: createdCustomers[11], rooms: [roomByNum['404']], checkInOffset: -12, nights: 4, status: 'checked_out', extraCharge: 500_000, extraServices: [{ name: 'Airport transfer', amount: 500_000 }] });

  // completed — paid & closed
  await makeBooking({ customer: createdCustomers[0], rooms: [roomByNum['204']], checkInOffset: -20, nights: 2, status: 'completed' });
  await makeBooking({ customer: createdCustomers[1], rooms: [roomByNum['304']], checkInOffset: -25, nights: 3, status: 'completed' });
  await makeBooking({ customer: createdCustomers[6], rooms: [roomByNum['503']], checkInOffset: -30, nights: 5, status: 'completed', note: 'Anniversary stay' });
  await makeBooking({ customer: createdCustomers[9], rooms: [roomByNum['202']], checkInOffset: -18, nights: 2, status: 'completed' });

  // confirmed extra — additional upcoming
  await makeBooking({ customer: createdCustomers[2], rooms: [roomByNum['405']], checkInOffset: 3, nights: 2, status: 'confirmed' });

  // pending — not yet paid (NOT visible in admin FE booking management)
  await Booking.create({
    customer_id:    createdCustomers[7]._id,
    rooms:          [{ room_id: roomByNum['105']._id, price_per_night: priceOf(roomByNum['105']) }],
    check_in:       days(2),
    check_out:      days(4),
    guests:         { adults: 1, children: 0 },
    totalPrice:     Math.round(1_100_000 * 2 * 1.15),
    depositAmount:  Math.round(1_100_000 * 2 * 1.15 * 0.3),
    extraCharge:    0,
    status:         'pending',
    holdExpiresAt:  new Date(now.getTime() + 20 * 60_000), // expires in 20 min
    createdAt:      new Date(),
  });

  await Booking.create({
    customer_id:    createdCustomers[11]._id,
    rooms:          [{ room_id: roomByNum['305']._id, price_per_night: priceOf(roomByNum['305']) }],
    check_in:       days(1),
    check_out:      days(3),
    guests:         { adults: 2, children: 1 },
    totalPrice:     Math.round(1_350_000 * 2 * 1.15),
    depositAmount:  Math.round(1_350_000 * 2 * 1.15 * 0.3),
    extraCharge:    0,
    status:         'pending',
    holdExpiresAt:  new Date(now.getTime() - 5 * 60_000), // already expired
    createdAt:      new Date(now.getTime() - 35 * 60_000),
  });

  // cancelled — with deposit (refund_status: pending → for manager to approve)
  const cancelledWithDeposit1 = await makeBooking({
    customer: createdCustomers[3], rooms: [roomByNum['205']], checkInOffset: 14, nights: 3,
    status: 'confirmed', note: 'Guest requested cancellation — family emergency',
  });
  await Booking.findByIdAndUpdate(cancelledWithDeposit1._id, {
    $set: { status: 'cancelled', cancelledAt: days(-1), refund_status: 'pending' },
  });

  const cancelledWithDeposit2 = await makeBooking({
    customer: createdCustomers[5], rooms: [roomByNum['103']], checkInOffset: 20, nights: 2,
    status: 'confirmed', note: 'Customer changed travel plans',
  });
  await Booking.findByIdAndUpdate(cancelledWithDeposit2._id, {
    $set: { status: 'cancelled', cancelledAt: days(-2), refund_status: 'pending' },
  });

  // cancelled — with deposit, awaiting_refund (manager approved, waiting for money transfer)
  const cancelledAwaiting = await makeBooking({
    customer: createdCustomers[8], rooms: [roomByNum['503']], checkInOffset: 25, nights: 4,
    status: 'confirmed', note: 'Approved for refund by manager',
  });
  await Booking.findByIdAndUpdate(cancelledAwaiting._id, {
    $set: { status: 'cancelled', cancelledAt: days(-3), refund_status: 'awaiting_refund' },
  });

  console.log('  23 bookings inserted (7 confirmed | 5 checked_in | 3 checked_out | 4 completed | 2 pending | 3 cancelled with refund)');

  // ── STEP 8: Seed Booking Draft ───────────────────────────────────────────
  console.log('\nSeeding booking draft...');
  await BookingDraft.create({
    staffId:        staffDocs.find(s => s.role === 'receptionist')._id,
    selectedRoomId: String(roomByNum['401']._id),
    formValue: {
      phone:          '0987654321',
      fullName:       'Nguyen Thi Draft',
      email:          'draft.customer@gmail.com',
      identityNumber: '045099999999',
      checkIn:        days(6).toISOString().split('T')[0],
      checkOut:       days(9).toISOString().split('T')[0],
      guests:         2,
      roomType:       'Deluxe Sea View',
      pricePerNight:  1_600_000,
      note:           'Guest requests high-floor sea view room',
    },
    updatedAt: new Date(),
  });
  console.log('  1 booking draft inserted');

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n────────────────────────────────────────────────────────');
  console.log('Seed complete! Summary:');
  console.log(`  ${accountSeed.length} accounts   (password: 123456)`);
  console.log(`  ${accountSeed.length} staff members`);
  console.log(`  ${createdCustomers.length} customers`);
  console.log(`  ${createdRoomTypes.length} room types  (Deluxe Street View | Deluxe Sea View | Deluxe Forest View | Deluxe Garden View | Superior Room)`);
  console.log(`  ${createdRooms.length} rooms`);
  console.log(`  ${serviceSeed.length} services`);
  console.log('  20 bookings  (7 confirmed | 5 checked_in | 3 checked_out | 4 completed | 2 pending)');
  console.log('  Payments created for all managed bookings');
  console.log('  1 booking draft');
  console.log('\nStaff login credentials:');
  accountSeed.forEach(a => console.log(`  [${a.role.padEnd(12)}] ${a.email}  /  123456`));
  console.log('────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
