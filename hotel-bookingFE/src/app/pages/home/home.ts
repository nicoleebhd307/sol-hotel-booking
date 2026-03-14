import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { HeroSectionComponent } from '../../components/hero-section/hero-section';
import { IntroSectionComponent } from '../../components/intro-section/intro-section';
import { FeaturedServicesComponent } from '../../components/featured-services/featured-services';
import { ExperienceOffersComponent } from '../../components/experience-offers/experience-offers';
import { PropertyBlockComponent } from '../../components/property-block/property-block';
import { StatisticsComponent } from '../../components/statistics/statistics';
import { CollectionComponent } from '../../components/collection/collection';
import { BookingCtaComponent } from '../../components/booking-cta/booking-cta';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    HeroSectionComponent,
    IntroSectionComponent,
    FeaturedServicesComponent,
    ExperienceOffersComponent,
    PropertyBlockComponent,
    StatisticsComponent,
    CollectionComponent,
    BookingCtaComponent,
    FooterComponent,
  ],
  templateUrl: './home.html',
})
export class HomeComponent {}
