import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { GorouteAuthApiService } from '../../../core/services/auth/goroute-auth-api.service';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './login-register.html',
  styleUrl: './login-register.scss',
})
export class LoginRegister implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(GorouteAuthApiService);

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly banner = signal<{ kind: 'err'; text: string } | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      role: this.fb.nonNullable.control<'professional' | 'company'>('professional'),
      companyName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: [LoginRegister.matchPasswords] },
  );

  private roleSub?: { unsubscribe: () => void };

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('role') === 'company') {
      this.form.patchValue({ role: 'company' }, { emitEvent: true });
    }

    this.roleSub = this.form.controls.role.valueChanges.subscribe((role) => {
      const c = this.form.controls.companyName;
      if (role === 'company') {
        c.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(256)]);
      } else {
        c.clearValidators();
        c.setValue('');
      }
      c.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.roleSub?.unsubscribe();
  }

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const { email, password, role, companyName } = this.form.getRawValue();
    this.submitting.set(true);
    this.banner.set(null);

    const reg$ =
      role === 'company'
        ? this.authApi.registerCompany(email, password, companyName.trim())
        : this.authApi.registerUser(email, password);

    reg$.subscribe({
        next: () => {
          this.submitting.set(false);
          void this.router.navigate(['/login'], { queryParams: { welcome: '1' } });
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          if (err instanceof HttpErrorResponse) {
            const code = (err.error as { error?: string } | null)?.error;
            if (err.status === 409 || code === 'USER_EXISTS') {
              this.banner.set({ kind: 'err', text: 'LOGIN.ERR_REGISTER_EXISTS' });
              return;
            }
            if (code === 'WEAK_PASSWORD') {
              this.banner.set({ kind: 'err', text: 'LOGIN.ERR_REGISTER_WEAK' });
              return;
            }
            if (code === 'COMPANY_NAME_REQUIRED') {
              this.banner.set({ kind: 'err', text: 'LOGIN.ERR_REGISTER_COMPANY' });
              return;
            }
          }
          this.banner.set({ kind: 'err', text: 'LOGIN.ERR_NETWORK' });
        },
      });
  }

  protected confirmTouchedMismatch(): boolean {
    const c = this.form.controls.confirm;
    return c.touched && !!this.form.errors?.['passwordMismatch'];
  }

  private static matchPasswords(control: AbstractControl): ValidationErrors | null {
    const pw = control.get('password')?.value as string | undefined;
    const cf = control.get('confirm')?.value as string | undefined;
    if (pw === undefined || cf === undefined) {
      return null;
    }
    return pw === cf ? null : { passwordMismatch: true };
  }
}
