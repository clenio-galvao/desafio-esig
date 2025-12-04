import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DsInputComponent } from '../../../../shared/design-system/ds-input/ds-input.component';
import { DsButtonComponent } from '../../../../shared/design-system/ds-button/ds-button.component';
import { LoginRequestDto } from '../../../../core/api/api.types';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../core/ui/toast.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DsInputComponent, DsButtonComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPageComponent {
  form: FormGroup;
  loading = false;
  submitted = false;
  apiError: string | null = null;
  infoMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly toast: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
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

  ngOnInit(): void {
    const justRegistered = this.route.snapshot.queryParamMap.get('registered');
    if (justRegistered) {
      this.infoMessage = 'Cadastro realizado com sucesso. Faça login para continuar.';
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.apiError = null;
    this.infoMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: LoginRequestDto = this.form.value as LoginRequestDto;

    this.loading = true;
    this.authService.login(payload).subscribe({
      next: response => {
        this.loading = false;
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/tasks';
        this.router.navigateByUrl(redirectTo);
        this.toast.showSuccess('Login realizado com sucesso.');
      },
      error: err => {
        console.error('entrei');
        this.loading = false;
        const message =
          err?.error?.message ?? 'Não foi possível realizar o login. Verifique suas credenciais.';
        this.apiError = message;
        console.error(message);
        this.toast.showError(message);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}

