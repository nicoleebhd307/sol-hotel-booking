import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../services/api.service';
import { ServiceItem } from '../../../models/home.models';

@Component({
  selector: 'app-experience-section',
  imports: [],
  templateUrl: './experience-section.html',
  styleUrl: './experience-section.css',
})
export class ExperienceSection {
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly services = signal<ServiceItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  
  protected readonly loopedServices = computed(() => {
    const items = this.services();
    return [...items, ...items];
  });

  constructor() {
    this.apiService
      .getServices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          console.log('Services loaded:', items);
          this.services.set(items);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading services:', err);
          this.hasError.set(true);
          this.isLoading.set(false);
        }
      });
  }
}
