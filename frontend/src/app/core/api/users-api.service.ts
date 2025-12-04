import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from './api.config';
import { UserOptionDto } from './api.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersApiService {
  private readonly http = inject(HttpClient);

  searchUsers(query?: string): Observable<UserOptionDto[]> {
    let params = new HttpParams();
    if (query && query.trim()) {
      params = params.set('q', query.trim());
    }
    return this.http.get<UserOptionDto[]>(`${API_BASE_URL}/users`, { params });
  }
}


