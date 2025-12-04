import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DsInputComponent } from '../../../../shared/design-system/ds-input/ds-input.component';
import { DsButtonComponent } from '../../../../shared/design-system/ds-button/ds-button.component';
import { AuthApiService } from '../../../../core/api/auth-api.service';
import { RegisterRequestDto } from '../../../../core/api/api.types';
import { ToastService } from '../../../../core/ui/toast.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DsInputComponent, DsButtonComponent],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPageComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  apiError: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authApi: AuthApiService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  private passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
  }

  get nameError(): string | null {
    const control = this.form.get('name');
    if (!control) return null;
    if (!control.touched && !this.submitted) return null;
    if (control.hasError('required')) return 'Nome é obrigatório';
    if (control.hasError('minlength')) return 'Nome deve ter ao menos 2 caracteres';
    return null;
  }

  get emailError(): string | null {
    const control = this.form.get('email');
    if (!control) return null;
    if (!control.touched && !this.submitted) return null;
    if (control.hasError('required')) return 'E-mail é obrigatório';
    if (control.hasError('email')) return 'Informe um e-mail válido';
    return null;
  }

  get passwordError(): string | null {
    const control = this.form.get('password');
    if (!control) return null;
    if (!control.touched && !this.submitted) return null;
    if (control.hasError('required')) return 'Senha é obrigatória';
    if (control.hasError('minlength')) return 'Senha deve ter ao menos 6 caracteres';
    return null;
  }

  get confirmPasswordError(): string | null {
    const control = this.form.get('confirmPassword');
    if (!control) return null;
    if (!control.touched && !this.submitted) return null;
    if (control.hasError('required')) return 'Confirmação de senha é obrigatória';
    if (this.form.hasError('passwordsMismatch')) return 'Senhas não conferem';
    return null;
  }

  onSubmit(): void {
    this.submitted = true;
    this.apiError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.value;
    const payload: RegisterRequestDto = { name, email, password };

    this.loading = true;
    this.authApi.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], { queryParams: { registered: '1' } });
        this.toast.showSuccess('Cadastro realizado com sucesso. Faça login para continuar.');
      },
      error: err => {
        this.loading = false;
        const message =
          err?.error?.message ?? 'Não foi possível realizar o cadastro. Tente novamente.';
        this.apiError = message;
        this.toast.showError(message);
      }
    });
  }
}


