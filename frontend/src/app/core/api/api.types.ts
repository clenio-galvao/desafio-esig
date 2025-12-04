export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  roles: string;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  roles?: string;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  roles: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserOptionDto {
  value: number;
  label: string;
}

export type TaskPriorityDto = 'ALTA' | 'MEDIA' | 'BAIXA';
export type TaskStatusDto = 'EM_ANDAMENTO' | 'CONCLUIDA';

export interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriorityDto;
  deadline: string;
  status: TaskStatusDto;
  responsible: string;
  responsibleId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequestDto {
  title: string;
  description?: string | null;
  priority: TaskPriorityDto;
  deadline: string;
  status?: TaskStatusDto;
  responsibleUserId?: number | null;
}

export interface UpdateTaskRequestDto {
  title?: string;
  description?: string | null;
  priority?: TaskPriorityDto;
  deadline?: string;
  status?: TaskStatusDto;
  responsibleUserId?: number | null;
}


