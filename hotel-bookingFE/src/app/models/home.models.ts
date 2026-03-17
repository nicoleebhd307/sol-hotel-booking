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
  title: string;
  description: string;
  imageUrl: string;
  priceFrom: number;
  amenities: RoomAmenity[];
  roomType: string;
  beds: number;
  sqft: number;
  guest: number;
  viewType: string;
  featured?: boolean;
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