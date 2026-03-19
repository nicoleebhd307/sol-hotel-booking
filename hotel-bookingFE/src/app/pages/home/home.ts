import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MainLayout } from '../../layouts/main-layout/main-layout';
import { HomeContent } from '../../services/home-content';

@Component({
	selector: 'app-home',
	imports: [MainLayout],
	templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
	private readonly homeContent = inject(HomeContent);
	private readonly destroyRef = inject(DestroyRef);

	protected readonly pageData = signal(this.homeContent.getHomePageData());

	ngOnInit(): void {
		this.homeContent
			.getAccommodationsFromAPI()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((accommodations) => {
				this.pageData.update((data) => ({ ...data, accommodations }));
			});
	}
}
