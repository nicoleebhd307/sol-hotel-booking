export interface NavLink {
  label: string;
  href: string;
}

export interface AvailabilityField {
  label: string;
  value: string;
  icon?: string;
}

export interface AccommodationCard {
  title: string;
  description: string;
  imageUrl: string;
  primaryAction: string;
  secondaryAction: string;
  featured?: boolean;
}

export interface OfferItem {
  title: string;
  active?: boolean;
  imageUrl?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  rating: number;
  source: string;
}

export interface NewsItem {
  date: string;
  title: string;
  imageUrl: string;
}

export interface SocialLink {
  label: string;
  icon: string;
  href: string;
}

export interface RoomAmenity {
  icon: string;
  label: string;
  value: string | number;
}

export interface RoomCard {
  id: number;
  roomTypeId?: string;
  title: string;
  description: string;
  imageUrl: string;
  priceFrom: number;
  amenities: RoomAmenity[];
  roomType: string;
  beds: number;
  bedOptions: string[];
  sqft: number;
  guest: number;
  capacityAdults: number;
  capacityChildren: number;
  viewType: string;
  featured?: boolean;
}

// Backend API Models
export interface Capacity {
  adults: number;
  children: number;
}

export interface RoomType {
  _id: string;
  name: string;
  area: number;
  price_per_night: number;
  bed_options: string[];
  capacity: Capacity;
  view?: string;
  description: string;
  image?: string[];
  images?: string[];
  amenities: string[];
  rate_includes: string[];
  service_charge: number;
  vat: boolean;
}

export interface Room {
  _id: string;
  room_number: string;
  room_type_id: string;
  floor: number;
  status: 'available' | 'booked' | 'maintenance';
  beach_view: boolean;
  is_active: boolean;
  roomType?: RoomType;
}

export interface ServiceItem {
  _id: string;
  title: string;
  imageUrl: string;
}

export interface BookingRoom {
  room_id: {
    _id: string;
    room_number: string;
    floor: number;
    room_type_id: RoomType;
  };
  price_per_night: number;
}

export interface BookingData {
  _id: string;
  customer_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    nationality?: string;
  };
  rooms: BookingRoom[];
  check_in: string;
  check_out: string;
  guests: { adults: number; children: number };
  totalPrice: number;
  depositAmount: number;
  extraCharge: number;
  status: string;
  note: string;
  refund_status: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export interface FilterOption {
  label: string;
  options: { name: string; count?: number }[];
}

export interface HomePageData {
  hero: {
    backgroundImageUrl: string;
    logoUrl: string;
    navLinks: NavLink[];
    welcomeEyebrow: string;
    headingLineOne: string;
    headingLineTwo: string;
    subHeading: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    reserveLabel: string;
  };
  availabilityFields: AvailabilityField[];
  intro: {
    backgroundImageUrl: string;
    logoUrl: string;
    heading: string;
    subHeading: string;
  };
  accommodations: AccommodationCard[];
  offers: {
    imageUrl: string;
    title: string;
    items: OfferItem[];
  };
  testimonials: {
    scoreText: string;
    reviewCountText: string;
    cards: Testimonial[];
  };
  news: {
    heading: string;
    description: string;
    items: NewsItem[];
  };
  bookingCta: {
    backgroundImageUrl: string;
    headingLineOne: string;
    headingLineTwo: string;
  };
  footer: {
    logoUrl: string;
    address: string;
    phone: string;
    email: string;
    links: string[];
    socials: SocialLink[];
  };
}