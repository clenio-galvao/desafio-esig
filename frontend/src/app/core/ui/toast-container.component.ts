import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {
  constructor(private readonly toastService: ToastService) {}

  get toasts$() {
    return this.toastService.toasts$;
  }

  trackById(_index: number, toast: ToastMessage): number {
    return toast.id;
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}


