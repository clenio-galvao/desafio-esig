import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ENDPOINTS } from './api.config';
import {
  CreateTaskRequestDto,
  TaskDto,
  TaskPriorityDto,
  UpdateTaskRequestDto
} from './api.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksApiService {
  private readonly http = inject(HttpClient);

  createTask(payload: CreateTaskRequestDto): Observable<TaskDto> {
    return this.http.post<TaskDto>(API_ENDPOINTS.tasks.root, payload);
  }

  updateTask(id: number, payload: UpdateTaskRequestDto): Observable<TaskDto> {
    return this.http.put<TaskDto>(`${API_ENDPOINTS.tasks.root}/${id}`, payload);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.tasks.root}/${id}`);
  }

  completeTask(id: number): Observable<TaskDto> {
    return this.http.patch<TaskDto>(`${API_ENDPOINTS.tasks.root}/${id}/concluir`, {});
  }

  linkTaskToCurrentUser(id: number): Observable<TaskDto> {
    return this.http.patch<TaskDto>(`${API_ENDPOINTS.tasks.root}/${id}/responsavel`, {});
  }

  getTaskById(id: number): Observable<TaskDto> {
    return this.http.get<TaskDto>(`${API_ENDPOINTS.tasks.root}/${id}`);
  }

  searchTasks(options: {
    title?: string;
    responsible?: string;
    priority?: TaskPriorityDto;
    deadlineFrom?: string;
    deadlineTo?: string;
    onlyNotConcluded?: boolean;
  }): Observable<TaskDto[]> {
    let params = new HttpParams();

    if (options.title) params = params.set('title', options.title);
    if (options.responsible) params = params.set('responsible', options.responsible);
    if (options.priority) params = params.set('priority', options.priority);
    if (options.deadlineFrom) params = params.set('deadlineFrom', options.deadlineFrom);
    if (options.deadlineTo) params = params.set('deadlineTo', options.deadlineTo);
    if (options.onlyNotConcluded !== undefined) {
      params = params.set('onlyNotConcluded', String(options.onlyNotConcluded));
    }

    return this.http.get<TaskDto[]>(API_ENDPOINTS.tasks.root, { params });
  }
}


