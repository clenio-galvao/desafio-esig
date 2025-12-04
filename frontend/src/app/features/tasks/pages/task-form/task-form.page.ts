import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DsInputComponent } from '../../../../shared/design-system/ds-input/ds-input.component';
import { DsButtonComponent } from '../../../../shared/design-system/ds-button/ds-button.component';
import {
  DsSelectAsyncComponent,
  DsSelectAsyncOption
} from '../../../../shared/design-system/ds-select-async/ds-select-async.component';
import {
  CreateTaskRequestDto,
  TaskDto,
  TaskPriorityDto,
  TaskStatusDto,
  UpdateTaskRequestDto
} from '../../../../core/api/api.types';
import { TasksApiService } from '../../../../core/api/tasks-api.service';
import { ToastService } from '../../../../core/ui/toast.service';
import { UsersApiService } from '../../../../core/api/users-api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DsInputComponent,
    DsButtonComponent,
    DsSelectAsyncComponent
  ],
  templateUrl: './task-form.page.html',
  styleUrl: './task-form.page.scss'
})
export class TaskFormPageComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  apiError: string | null = null;

  isEditMode = false;
  taskId: number | null = null;
  responsibleInitialLabel: string | null = null;

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
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toast: ToastService,
    private readonly usersApi: UsersApiService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      responsibleUserId: [null],
      priority: ['MEDIA' as TaskPriorityDto, [Validators.required]],
      deadline: ['', [Validators.required]],
      status: ['EM_ANDAMENTO' as TaskStatusDto, [Validators.required]]
    });
  }

  searchUserOptions = (term: string): Observable<DsSelectAsyncOption<number>[]> =>
    this.usersApi.searchUsers(term ?? '');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.taskId = Number(idParam);
      this.loadTask(this.taskId);
    }
  }

  private loadTask(id: number): void {
    this.loading = true;
    this.tasksApi.getTaskById(id).subscribe({
      next: (task: TaskDto) => {
        this.loading = false;
        this.form.patchValue({
          title: task.title,
          description: task.description,
          responsibleUserId: task.responsibleId,
          priority: task.priority,
          deadline: task.deadline,
          status: task.status
        });
        this.responsibleInitialLabel = task.responsible ?? null;
      },
      error: () => {
        this.loading = false;
        this.apiError = 'Não foi possível carregar a tarefa para edição.';
      }
    });
  }

  get titleError(): string | null {
    const control = this.form.get('title');
    if (!control) return null;
    if (!control.touched && !this.submitted) return null;
    if (control.hasError('required')) return 'Título é obrigatório';
    if (control.hasError('maxlength')) return 'Título muito longo';
    return null;
  }

  get priorityError(): string | null {
    const control = this.form.get('priority');
    if (!control) return null;
    if (!control.touched && !this.submitted) return null;
    if (control.hasError('required')) return 'Prioridade é obrigatória';
    return null;
  }

  get deadlineError(): string | null {
    const control = this.form.get('deadline');
    if (!control) return null;
    if (!control.touched && !this.submitted) return null;
    if (control.hasError('required')) return 'Deadline é obrigatório';
    return null;
  }

  onSubmit(): void {
    this.submitted = true;
    this.apiError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;

    if (this.isEditMode && this.taskId != null) {
      const payload: UpdateTaskRequestDto = {
        title: raw.title,
        description: raw.description,
        responsibleUserId: raw.responsibleUserId,
        priority: raw.priority,
        deadline: raw.deadline,
        status: raw.status
      };

      this.loading = true;
      this.tasksApi.updateTask(this.taskId, payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/tasks']);
          this.toast.showSuccess('Tarefa atualizada com sucesso.');
        },
        error: () => {
          this.loading = false;
          const message = 'Não foi possível salvar a tarefa. Tente novamente.';
          this.apiError = message;
          this.toast.showError(message);
        }
      });
    } else {
      const payload: CreateTaskRequestDto = {
        title: raw.title,
        description: raw.description,
        responsibleUserId: raw.responsibleUserId,
        priority: raw.priority,
        deadline: raw.deadline,
        status: raw.status
      };

      this.loading = true;
      this.tasksApi.createTask(payload).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/tasks']);
          this.toast.showSuccess('Tarefa criada com sucesso.');
        },
        error: () => {
          this.loading = false;
          const message = 'Não foi possível criar a tarefa. Tente novamente.';
          this.apiError = message;
          this.toast.showError(message);
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/tasks']);
  }
}

