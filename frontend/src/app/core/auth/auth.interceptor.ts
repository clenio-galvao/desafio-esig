import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../api/api.config';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Só adiciona Authorization para chamadas à nossa API e quando há token.
  const shouldAttach =
    !!token &&
    req.url.startsWith(API_BASE_URL);

  const requestToHandle = shouldAttach
    ? req.clone({
        setHeaders: {
          Authorization: token as string
        }
      })
    : req;

  const isAuthEndpoint =
    req.url.startsWith(`${API_BASE_URL}/auth/login`) ||
    req.url.startsWith(`${API_BASE_URL}/auth/register`);

  return next(requestToHandle).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isAuthEndpoint && (error.status === 401 || error.status === 403)) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};


