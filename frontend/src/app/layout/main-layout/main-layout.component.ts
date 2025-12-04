import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from '../../core/ui/toast-container.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ToastContainerComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  constructor(private readonly authService: AuthService) {}

  get userName(): string | null {
    return this.authService.getCurrentUser()?.name ?? null;
  }

  onLogout(): void {
    this.authService.logout();
  }
}

