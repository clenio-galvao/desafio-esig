import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { AuthApiService } from '../api/auth-api.service';
import { LoginResponseDto } from '../api/api.types';

describe('AuthService', () => {
  let service: AuthService;
  let authApiSpy: Pick<AuthApiService, 'login'>;
  let routerSpy: Pick<Router, 'navigate'>;

  beforeEach(() => {
    authApiSpy = {
      login: vi.fn()
    } as unknown as AuthApiService;

    routerSpy = {
      navigate: vi.fn()
    } as unknown as Router;

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApiService, useValue: authApiSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should store token and user on successful login', () => {
    const response: LoginResponseDto = {
      token: 'jwt-token',
      tokenType: 'Bearer',
      userId: 1,
      name: 'Test User',
      email: 'test@example.com',
      roles: 'ROLE_USER'
    };

    (authApiSpy.login as any).mockReturnValue(of(response));

    service.login({ email: 'test@example.com', password: '123456' }).subscribe();

    const storedToken = service.getToken();
    const storedUser = service.getCurrentUser();

    expect(storedToken).toBe('Bearer jwt-token');
    expect(storedUser).toEqual(response);
  });

  it('should clear session and navigate to login on logout', () => {
    sessionStorage.setItem('auth_token', 'token');
    sessionStorage.setItem(
      'auth_user',
      JSON.stringify({ email: 'test@example.com' })
    );

    service.logout();

    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('auth_user')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return false for isAuthenticated when there is no token', () => {
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should return true for isAuthenticated when token is valid and not expired', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 60 * 60; // +1h
    const payload = btoa(JSON.stringify({ exp: futureExp }));
    const token = `xxx.${payload}.yyy`;
    sessionStorage.setItem('auth_token', `Bearer ${token}`);

    expect(service.isAuthenticated()).toBeTruthy();
  });

  it('should return false and logout when token is expired', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60; // -1min
    const payload = btoa(JSON.stringify({ exp: pastExp }));
    const token = `xxx.${payload}.yyy`;
    sessionStorage.setItem('auth_token', `Bearer ${token}`);

    const result = service.isAuthenticated();

    expect(result).toBeFalsy();
    expect((routerSpy.navigate as any)).toHaveBeenCalledWith(['/login']);
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('should check roles correctly with hasRole', () => {
    const response: LoginResponseDto = {
      token: 'jwt-token',
      tokenType: 'Bearer',
      userId: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      roles: 'ROLE_USER,ROLE_ADMIN'
    };

    sessionStorage.setItem('auth_user', JSON.stringify(response));

    expect(service.hasRole('ROLE_ADMIN')).toBeTruthy();
    expect(service.hasRole('ROLE_USER')).toBeTruthy();
    expect(service.hasRole('ROLE_UNKNOWN' as any)).toBeFalsy();
  });
});


