import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DsButtonComponent } from '../../../../shared/design-system/ds-button/ds-button.component';
import { DsInputComponent } from '../../../../shared/design-system/ds-input/ds-input.component';
import { DsSelectComponent } from '../../../../shared/design-system/ds-select/ds-select.component';
import { DsCheckboxComponent } from '../../../../shared/design-system/ds-checkbox/ds-checkbox.component';
import { DsDatepickerComponent } from '../../../../shared/design-system/ds-datepicker/ds-datepicker.component';
import {
  DsSelectAsyncComponent,
  DsSelectAsyncOption
} from '../../../../shared/design-system/ds-select-async/ds-select-async.component';
import {
  DsDropdownComponent,
  DsDropdownItem
} from '../../../../shared/design-system/ds-dropdown/ds-dropdown.component';
import { DsTextareaComponent } from '../../../../shared/design-system/ds-textarea/ds-textarea.component';
import {
  CreateTaskRequestDto,
  Role,
  TaskDto,
  TaskPriorityDto,
  TaskStatusDto,
  UpdateTaskRequestDto,
  UserOptionDto
} from '../../../../core/api/api.types';
import { TasksApiService } from '../../../../core/api/tasks-api.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../core/ui/toast.service';
import { Router } from '@angular/router';
import { UsersApiService } from '../../../../core/api/users-api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DsButtonComponent,
    DsInputComponent,
    DsSelectComponent,
    DsCheckboxComponent,
    DsDatepickerComponent,
    DsSelectAsyncComponent,
    DsDropdownComponent,
    DsTextareaComponent
  ],
  templateUrl: './task-list.page.html',
  styleUrl: './task-list.page.scss'
})
export class TaskListPageComponent implements OnInit {
  tasks: TaskDto[] = [];

  filtersForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  currentUserId = 0;
  currentUserRoles: Role[] = ['ROLE_USER'];

  showCreateModal = false;
  expandedTaskId: number | null = null;
  taskForm: FormGroup;
  taskModalLoading = false;
  taskModalSubmitted = false;
  taskModalError: string | null = null;
  editingTask: TaskDto | null = null;
  taskResponsibleInitialLabel: string | null = null;
  linkResponsibleInitialLabel: string | null = null;
  linkModalTask: TaskDto | null = null;
  linkForm: FormGroup;
  linkModalLoading = false;
  linkModalSubmitted = false;
  linkModalError: string | null = null;
  readonly actionItems: Record<
    'edit' | 'delete' | 'link' | 'conclude',
    DsDropdownItem<'edit' | 'delete' | 'link' | 'conclude'>
  > = {
    edit: { id: 'edit', label: 'Editar' },
    delete: { id: 'delete', label: 'Excluir', variant: 'danger' },
    link: { id: 'link', label: 'Vincular responsável' },
    conclude: { id: 'conclude', label: 'Concluir' }
  };

  priorities: { value: TaskPriorityDto; label: string }[] = [
    { value: 'ALTA', label: 'Alta' },
    { value: 'MEDIA', label: 'Média' },
    { value: 'BAIXA', label: 'Baixa' }
  ];

  statuses: { value: TaskStatusDto; label: string }[] = [
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'CONCLUIDA', label: 'Concluída' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly tasksApi: TasksApiService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService,
    private readonly usersApi: UsersApiService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.filtersForm = this.fb.group({
      title: [''],
      responsible: [''],
      deadlineFrom: [''],
      deadlineTo: [''],
      onlyNotConcluded: [true]
    });

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      responsibleUserId: [null],
      priority: ['MEDIA' as TaskPriorityDto, [Validators.required]],
      deadline: ['', [Validators.required]],
      status: ['EM_ANDAMENTO' as TaskStatusDto, [Validators.required]]
    });

    this.linkForm = this.fb.group({
      responsibleUserId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadTasks();
  }

  private loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.currentUserId = user.userId;
    this.currentUserRoles = user.roles
      .split(',')
      .map(role => role.trim() as Role);
  }

  get isAdmin(): boolean {
    return this.currentUserRoles.includes('ROLE_ADMIN');
  }

  searchUserOptions = (term: string): Observable<DsSelectAsyncOption<number>[]> =>
    this.usersApi.searchUsers(term ?? '');

  canEdit(task: TaskDto): boolean {
    if (this.isAdmin) return true;
    return task.responsibleId === this.currentUserId && task.status !== 'CONCLUIDA';
  }

  canDelete(task: TaskDto): boolean {
    return this.canEdit(task);
  }

  canLink(task: TaskDto): boolean {
    if (task.status === 'CONCLUIDA') return false;
    // Só faz sentido exibir "Vincular responsável" quando ainda não há responsável.
    return task.responsibleId == null;
  }

  canConclude(task: TaskDto): boolean {
    // Só pode concluir se tiver permissão de edição e não estiver concluída.
    return this.canEdit(task) && task.status !== 'CONCLUIDA';
  }

  openCreateModal(): void {
    this.editingTask = null;
    this.taskModalSubmitted = false;
    this.taskModalError = null;
    this.taskForm.reset({
      title: '',
      description: '',
      responsibleUserId: null,
      priority: 'MEDIA',
      deadline: '',
      status: 'EM_ANDAMENTO'
    });
    this.taskResponsibleInitialLabel = null;
    this.showCreateModal = true;
  }

  openEditModal(task: TaskDto): void {
    this.editingTask = task;
    this.taskModalSubmitted = false;
    this.taskModalError = null;
    this.taskForm.reset({
      title: task.title,
      description: task.description,
      responsibleUserId: task.responsibleId,
      priority: task.priority,
      deadline: task.deadline,
      status: task.status
    });
    this.taskResponsibleInitialLabel = task.responsible ?? null;
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onEdit(task: TaskDto): void {
    if (!this.canEdit(task)) return;
    this.openEditModal(task);
  }

  onDelete(task: TaskDto): void {
    if (!this.canDelete(task)) return;
    const confirmDelete = window.confirm(`Deseja realmente excluir a tarefa "${task.title}"?`);
    if (!confirmDelete) return;

    this.loading = true;
    this.tasksApi.deleteTask(task.id).subscribe({
      next: () => {
        this.loadTasks();
        this.toast.showSuccess('Tarefa excluída com sucesso.');
      },
      error: () => {
        this.loading = false;
        const message = 'Não foi possível excluir a tarefa. Tente novamente.';
        this.errorMessage = message;
        this.toast.showError(message);
      }
    });
  }

  onConclude(task: TaskDto): void {
    this.tasksApi.completeTask(task.id).subscribe({
      next: updated => {
        this.tasks = this.tasks.map(t => (t.id === updated.id ? updated : t));
        this.toast.showSuccess('Tarefa concluída com sucesso.');
      },
      error: () => {
        const message = 'Não foi possível concluir a tarefa. Tente novamente.';
        this.errorMessage = message;
        this.toast.showError(message);
      }
    });
  }

  onSearch(): void {
    this.loadTasks();
  }

  getTaskActions(task: TaskDto): DsDropdownItem<'edit' | 'delete' | 'link' | 'conclude'>[] {
    const items: DsDropdownItem<'edit' | 'delete' | 'link' | 'conclude'>[] = [];

    // Editar e Excluir sempre aparecem; o backend ainda valida permissões.
    items.push(this.actionItems.edit);
    items.push(this.actionItems.delete);

    if (this.canLink(task)) {
      items.push(this.actionItems.link);
    }

    if (this.canConclude(task)) {
      // Exibimos a ação "Concluir" apenas quando o usuário pode concluir,
      // sem aplicar desabilitado/tooltip no dropdown. O backend ainda valida permissões.
      items.push(this.actionItems.conclude);
    }

    return items;
  }

  onCreate(): void {
    this.openCreateModal();
  }

  onTaskAction(task: TaskDto, actionId: 'edit' | 'delete' | 'link' | 'conclude'): void {
    switch (actionId) {
      case 'edit':
        this.onEdit(task);
        break;
      case 'delete':
        this.onDelete(task);
        break;
      case 'link':
        if (this.isAdmin) {
          // Admin escolhe o responsável em um modal dedicado.
          this.openLinkModal(task);
        } else {
          // ROLE_USER se vincula automaticamente à tarefa via endpoint dedicado.
          this.tasksApi.linkTaskToCurrentUser(task.id).subscribe({
            next: updated => {
              this.tasks = this.tasks.map(t => (t.id === updated.id ? updated : t));
              this.toast.showSuccess('Você foi vinculado como responsável pela tarefa.');
            },
            error: () => {
              const message = 'Não foi possível vincular a tarefa. Tente novamente.';
              this.errorMessage = message;
              this.toast.showError(message);
            }
          });
        }
        break;
      case 'conclude':
        this.onConclude(task);
        break;
    }
  }

  private loadTasks(): void {
    this.loading = true;
    this.errorMessage = null;

    const raw = this.filtersForm.value;

    this.tasksApi
      .searchTasks({
        title: raw.title?.trim() || undefined,
        responsible: raw.responsible?.trim() || undefined,
        deadlineFrom: this.normalizeDate(raw.deadlineFrom),
        deadlineTo: this.normalizeDate(raw.deadlineTo),
        onlyNotConcluded: raw.onlyNotConcluded
      })
      .subscribe({
        next: tasks => {
          this.tasks = tasks;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          const message = 'Não foi possível carregar as tarefas. Tente novamente.';
          this.errorMessage = message;
          this.toast.showError(message);
          this.cdr.markForCheck();
        }
      });
  }

  trackByTaskId(_index: number, task: TaskDto): number {
    return task.id;
  }

  onRowClick(task: TaskDto): void {
    this.expandedTaskId = this.expandedTaskId === task.id ? null : task.id;
  }

  isExpanded(task: TaskDto): boolean {
    return this.expandedTaskId === task.id;
  }

  private normalizeDate(value: unknown): string | undefined {
    if (!value) return undefined;
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().substring(0, 10);
    }
    return String(value);
  }

  onSaveTask(): void {
    this.taskModalSubmitted = true;
    this.taskModalError = null;

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const raw = this.taskForm.value;

    this.taskModalLoading = true;

    if (this.editingTask) {
      const payload: UpdateTaskRequestDto = {
        title: raw.title,
        description: raw.description,
        responsibleUserId: raw.responsibleUserId,
        priority: raw.priority,
        deadline: this.normalizeDate(raw.deadline)!,
        status: raw.status
      };

      this.tasksApi.updateTask(this.editingTask.id, payload).subscribe({
        next: () => {
          this.taskModalLoading = false;
          this.closeCreateModal();
          this.loadTasks();
          this.toast.showSuccess('Tarefa atualizada com sucesso.');
        },
        error: () => {
          this.taskModalLoading = false;
          const message = 'Não foi possível salvar a tarefa. Tente novamente.';
          this.taskModalError = message;
          this.toast.showError(message);
        }
      });
    } else {
      const payload: CreateTaskRequestDto = {
        title: raw.title,
        description: raw.description,
        responsibleUserId: raw.responsibleUserId,
        priority: raw.priority,
        deadline: this.normalizeDate(raw.deadline)!,
        status: raw.status
      };

      this.tasksApi.createTask(payload).subscribe({
        next: () => {
          this.taskModalLoading = false;
          this.closeCreateModal();
          this.loadTasks();
          this.toast.showSuccess('Tarefa criada com sucesso.');
        },
        error: () => {
          this.taskModalLoading = false;
          const message = 'Não foi possível criar a tarefa. Tente novamente.';
          this.taskModalError = message;
          this.toast.showError(message);
        }
      });
    }
  }

  openLinkModal(task: TaskDto): void {
    this.linkModalTask = task;
    this.linkModalSubmitted = false;
    this.linkModalError = null;
    this.linkForm.reset({
      responsibleUserId: task.responsibleId ?? null
    });
    this.linkResponsibleInitialLabel = task.responsible ?? null;
  }

  closeLinkModal(): void {
    this.linkModalTask = null;
  }

  onSaveLink(): void {
    this.linkModalSubmitted = true;
    this.linkModalError = null;

    if (!this.linkModalTask || this.linkForm.invalid) {
      this.linkForm.markAllAsTouched();
      return;
    }

    const { responsibleUserId } = this.linkForm.value;
    this.linkModalLoading = true;

    const payload: UpdateTaskRequestDto = {
      responsibleUserId
    };

    this.tasksApi.updateTask(this.linkModalTask.id, payload).subscribe({
      next: updated => {
        this.linkModalLoading = false;
        this.closeLinkModal();
        this.tasks = this.tasks.map(t => (t.id === updated.id ? updated : t));
        this.toast.showSuccess('Responsável vinculado com sucesso.');
      },
      error: () => {
        this.linkModalLoading = false;
        const message = 'Não foi possível vincular o responsável. Tente novamente.';
        this.linkModalError = message;
        this.toast.showError(message);
      }
    });
  }
}
