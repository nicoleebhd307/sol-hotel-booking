import { Component, inject } from '@angular/core';
import { MainLayout } from '../../layouts/main-layout/main-layout';
import { HomeContent } from '../../services/home-content';

@Component({
	selector: 'app-home',
	imports: [MainLayout],
	templateUrl: './home.html',
})
export class HomeComponent {
	private readonly homeContent = inject(HomeContent);
	protected readonly pageData = this.homeContent.getHomePageData();
}
