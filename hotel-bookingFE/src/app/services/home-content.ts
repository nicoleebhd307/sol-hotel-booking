import { Injectable } from '@angular/core';
import { HomePageData } from '../models/home.models';

@Injectable({
  providedIn: 'root',
})
export class HomeContent {
  getHomePageData(): HomePageData {
    return {
      hero: {
        backgroundImageUrl:
          'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80',
        logoUrl: 'assets/images/sol-white.png',
        navLinks: [
          { label: 'Home', href: '/' },
          { label: 'Our Stories', href: '/stories' },
          { label: 'Accommodations', href: '/rooms' },
        ],
        welcomeEyebrow: 'Welcome to',
        headingLineOne: 'Experience',
        headingLineTwo: 'New Perspective',
        subHeading: 'Find your quiet rhythm between ocean breeze, warm sunlight, and refined tropical living.',
        primaryCtaLabel: 'Reserve now',
        primaryCtaHref: '#',
        secondaryCtaLabel: 'Explore rooms',
        secondaryCtaHref: '#accommodations',
        reserveLabel: 'Reserve now',
      },
      availabilityFields: [
        { label: 'Check In', value: 'Oct 12, 2026' },
        { label: 'Check Out', value: 'Oct 18, 2026' },
        { label: 'Guests', value: '2 Adults, 1 Child', icon: 'keyboard_arrow_down' },
        { label: 'Room Type', value: 'Ocean Front Lanai', icon: 'keyboard_arrow_down' },
      ],
      intro: {
        backgroundImageUrl:'https://plus.unsplash.com/premium_photo-1669863547357-b7d064cedaac?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' ,
        logoUrl: 'assets/images/sol-gold.png',
        heading: 'Sol An Bang Beach Resort & Spa',
        subHeading: 'A Beachfront Hideaway Amidst Pristine Casuarina Forests',
      },
      accommodations: [
        {
          title: 'Deluxe Forest View',
          description: 'Where sun, sea and sand come together just footsteps from the shoreline.',
          imageUrl:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
          primaryAction: 'Details',
          secondaryAction: 'Explore More',
        },
        {
          title: 'Deluxe Sea View',
          description:
            'Elevate your stay in our premium oceanfront room with private lanai and golden sunrise views.',
          imageUrl:
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80',
          primaryAction: 'Details',
          secondaryAction: 'Book Now',
          featured: true,
        },
        {
          title: 'Deluxe Street View',
          description:
            'Watch local life unfold from a calm, modern room designed for restful nights and easy mornings.',
          imageUrl:
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
          primaryAction: 'Details',
          secondaryAction: 'Explore More',
        },
      ],
      offers: {
        imageUrl:
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
        title: 'The Experience Offers',
        items: [
          {
            title: 'Resort',
            imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
          },
          {
            title: 'Accommodation',
            active: true,
            imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
          },
          {
            title: 'Event & Wedding',
            imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
          },
          {
            title: 'Wine & Dine',
            imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
          },
          {
            title: 'Wellness',
            imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80',
          },
        ],
      },
      testimonials: {
        scoreText: 'Good',
        reviewCountText: 'Based on 392 reviews',
        cards: [
          {
            quote:
              'A truly transcendental experience. From the moment we arrived, we were treated like royalty.',
            author: 'Alexander Mercer',
            rating: 5,
            source: 'Verified Review',
          },
          {
            quote:
              'The Ocean Front Lanai was breathtaking. Watching the sunrise from our balcony is a memory I will cherish forever.',
            author: 'Elena Rodriguez',
            rating: 5,
            source: 'Verified Review',
          },
        ],
      },
      news: {
        heading: "What's New at Our Resort",
        description:
          'Discover the beauty of Sol An Bang where beachfront serenity, tropical nature, and thoughtful design come together.',
        items: [
          {
            date: 'March 27, 2026',
            title: 'Family Travel in Hoi An: Why Sol An Bang is the Perfect Choice?',
            imageUrl:
              'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80',
          },
          {
            date: 'March 27, 2026',
            title: 'A Weekend Guide to Slow Luxury by the Shoreline',
            imageUrl:
              'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80',
          },
        ],
      },
      bookingCta: {
        backgroundImageUrl:
        'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        headingLineOne: 'Experience the perfect',
        headingLineTwo: 'blend of luxury',
      },
      footer: {
        logoUrl: 'assets/images/sol-gold.png',
        address: '72 Nguyen Phan Vinh, Hoi An, Vietnam',
        phone: '(+84) 02353 937579',
        email: 'info@solanbang.com',
        links: ['Terms & Conditions', 'Privacy Policy', 'Cookies Policy'],
        socials: [
          { label: 'WhatsApp', icon: 'chat', href: '#' },
          { label: 'Instagram', icon: 'photo_camera', href: '#' },
          { label: 'Facebook', icon: 'thumb_up', href: '#' },
        ],
      },
    };
  }
}
