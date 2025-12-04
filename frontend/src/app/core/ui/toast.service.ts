import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private counter = 0;
  private readonly _toasts$ = new BehaviorSubject<ToastMessage[]>([]);

  readonly toasts$ = this._toasts$.asObservable();

  showSuccess(text: string): void {
    this.push('success', text);
  }

  showError(text: string): void {
    this.push('error', text);
  }

  showInfo(text: string): void {
    this.push('info', text);
  }

  dismiss(id: number): void {
    this._toasts$.next(this._toasts$.value.filter(t => t.id !== id));
  }

  private push(type: ToastType, text: string): void {
    const toast: ToastMessage = {
      id: ++this.counter,
      type,
      text
    };

    this._toasts$.next([...this._toasts$.value, toast]);

    setTimeout(() => {
      this.dismiss(toast.id);
    }, 4000);
  }
}


