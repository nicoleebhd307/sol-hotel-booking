import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomePageData } from '../../../models/home.models';

@Component({
  selector: 'app-intro',
  imports: [RouterLink],
  templateUrl: './intro.html',
  styleUrl: './intro.css',
})
export class Intro {
  readonly data = input.required<HomePageData['intro']>();
}
