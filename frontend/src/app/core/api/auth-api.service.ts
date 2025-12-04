import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from './api.config';
import { LoginRequestDto, LoginResponseDto, RegisterRequestDto, UserDto } from './api.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(payload: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(API_ENDPOINTS.auth.login, payload);
  }

  register(payload: RegisterRequestDto): Observable<UserDto> {
    return this.http.post<UserDto>(API_ENDPOINTS.auth.register, payload);
  }
}


