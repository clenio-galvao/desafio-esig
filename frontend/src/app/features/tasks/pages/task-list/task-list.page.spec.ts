import { FormBuilder } from '@angular/forms';
import { vi } from 'vitest';

import { TaskListPageComponent } from './task-list.page';
import { TaskDto } from '../../../../core/api/api.types';

describe('TaskListPageComponent (unit)', () => {
  let component: TaskListPageComponent;

  const createTask = (overrides: Partial<TaskDto> = {}): TaskDto => ({
    id: overrides.id ?? 1,
    title: overrides.title ?? 'Task',
    description: overrides.description ?? null,
    priority: overrides.priority ?? 'MEDIA',
    deadline: overrides.deadline ?? '2025-12-31',
    status: overrides.status ?? 'EM_ANDAMENTO',
    responsible: overrides.responsible ?? 'User',
    // Permite forçar null explicitamente sem cair no valor padrão
    responsibleId:
      Object.prototype.hasOwnProperty.call(overrides, 'responsibleId')
        ? (overrides.responsibleId as number | null)
        : 1,
    createdAt: overrides.createdAt ?? '2025-01-01T00:00:00Z',
    updatedAt: overrides.updatedAt ?? '2025-01-01T00:00:00Z'
  });

  beforeEach(() => {
    const fb = new FormBuilder();

    component = new TaskListPageComponent(
      fb,
      {} as any, // TasksApiService
      {} as any, // AuthService
      {} as any, // Router
      {} as any, // ToastService
      {} as any, // UsersApiService
      { markForCheck: () => {} } as any // ChangeDetectorRef
    );

    component.currentUserId = 1;
    component.currentUserRoles = ['ROLE_USER'];
  });

  it('should allow admin to edit any task', () => {
    component.currentUserRoles = ['ROLE_ADMIN'];
    const task = createTask({ responsibleId: 999, status: 'CONCLUIDA' });

    expect(component.canEdit(task)).toBeTruthy();
  });

  it('should allow user to edit own non-concluded tasks', () => {
    const task = createTask({ responsibleId: 1, status: 'EM_ANDAMENTO' });

    expect(component.canEdit(task)).toBeTruthy();
  });

  it('should not allow user to edit tasks of others or concluded tasks', () => {
    const otherUserTask = createTask({ responsibleId: 2, status: 'EM_ANDAMENTO' });
    const concludedTask = createTask({ responsibleId: 1, status: 'CONCLUIDA' });

    expect(component.canEdit(otherUserTask)).toBeFalsy();
    expect(component.canEdit(concludedTask)).toBeFalsy();
  });

  it('canDelete should delegate to canEdit', () => {
    const task = createTask({ responsibleId: 1, status: 'EM_ANDAMENTO' });
    const spy = vi.spyOn(component, 'canEdit').mockReturnValue(true);

    expect(component.canDelete(task)).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(task);
  });

  it('should allow link only when there is no responsible and task is not concluded', () => {
    const noResponsible = createTask({ responsibleId: null, status: 'EM_ANDAMENTO' });
    const withResponsible = createTask({ responsibleId: 1, status: 'EM_ANDAMENTO' });
    const concluded = createTask({ responsibleId: null, status: 'CONCLUIDA' });

    expect(component.canLink(noResponsible)).toBeTruthy();
    expect(component.canLink(withResponsible)).toBeFalsy();
    expect(component.canLink(concluded)).toBeFalsy();
  });

  it('getTaskActions should always include edit and delete', () => {
    const task = createTask();

    const actions = component.getTaskActions(task).map(a => a.id);

    expect(actions).toContain('edit');
    expect(actions).toContain('delete');
  });

  it('getTaskActions should include link and conclude based on permissions', () => {
    const task = createTask({ responsibleId: null, status: 'EM_ANDAMENTO' });
    vi.spyOn(component, 'canLink').mockReturnValue(true);
    vi.spyOn(component, 'canConclude').mockReturnValue(true);

    const actions = component.getTaskActions(task).map(a => a.id);

    expect(actions).toContain('link');
    expect(actions).toContain('conclude');
  });
});

