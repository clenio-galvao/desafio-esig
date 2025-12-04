import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../api/auth-api.service';
import { LoginRequestDto, LoginResponseDto, Role } from '../api/api.types';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private readonly authApi: AuthApiService,
    private readonly router: Router
  ) {}

  login(payload: LoginRequestDto): Observable<LoginResponseDto> {
    return this.authApi.login(payload).pipe(
      tap(response => this.setSession(response))
    );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  private setSession(response: LoginResponseDto): void {
    const tokenWithType = `${response.tokenType} ${response.token}`;
    sessionStorage.setItem(TOKEN_KEY, tokenWithType);
    sessionStorage.setItem(USER_KEY, JSON.stringify(response));
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  getCurrentUser(): LoginResponseDto | null {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as LoginResponseDto;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  hasRole(role: Role): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;

    return user.roles.split(',').map(r => r.trim()).includes(role);
  }

  private isTokenExpired(tokenWithType: string): boolean {
    try {
      const token = tokenWithType.split(' ')[1] ?? tokenWithType;
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return false;

      const decoded = JSON.parse(atob(payloadPart)) as { exp?: number };
      if (!decoded.exp) return false;

      const nowInSeconds = Math.floor(Date.now() / 1000);
      return decoded.exp < nowInSeconds;
    } catch {
      // Em caso de erro ao decodificar, consideramos o token inválido/expirado.
      return true;
    }
  }
}


