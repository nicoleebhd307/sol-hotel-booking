import { Component } from '@angular/core';
import { input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  imports: [],
  templateUrl: './section-heading.html',
  styleUrl: './section-heading.css',
})
export class SectionHeading {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
