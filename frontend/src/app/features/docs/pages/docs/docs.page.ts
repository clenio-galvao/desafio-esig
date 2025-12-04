import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-docs-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './docs.page.html',
  styleUrl: './docs.page.scss'
})
export class DocsPageComponent {
  constructor(private readonly location: Location) {}

  goBack(): void {
    this.location.back();
  }
}



