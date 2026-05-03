import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { GorouteAuthApiService } from '../../../core/services/auth/goroute-auth-api.service';
import { PostAuthNavigationService } from '../../../core/services/login/post-auth-navigation.service';
import { LoginFlowService } from '../../../core/services/login/login-flow.service';

@Component({
  selector: 'app-login-mfa',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './login-mfa.html',
  styleUrl: './login-mfa.scss',
})
export class LoginMfa implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly flow = inject(LoginFlowService);
  private readonly authApi = inject(GorouteAuthApiService);
  private readonly postAuth = inject(PostAuthNavigationService);

  protected readonly submitting = signal(false);
  protected readonly error = signal(false);

  private errorClear?: number;

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  protected readonly maskedEmail = computed(() => {
    const raw = this.flow.pendingMfaEmail();
    if (!raw) {
      return '';
    }
    const [user, domain] = raw.split('@');
    if (!domain) {
      return raw;
    }
    const u = user.length <= 2 ? `${user[0] ?? ''}•` : `${user.slice(0, 2)}•••`;
    return `${u}@${domain}`;
  });

  ngOnDestroy(): void {
    if (this.errorClear) {
      window.clearTimeout(this.errorClear);
    }
  }

  protected submit(): void {
    this.form.controls.code.markAsTouched();
    if (this.form.invalid) {
      return;
    }

    const token = this.flow.pendingMfaTempToken();
    if (!token) {
      void this.router.navigateByUrl(this.flow.afterMfaReturnPath());
      return;
    }

    const code = this.form.getRawValue().code;
    this.submitting.set(true);
    this.error.set(false);

    this.authApi.verifyMfa(token, code).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.flow.clearMfa();
        const role = res.role ?? 'professional';
        const onboardingDone =
          typeof res.onboardingCompleted === 'boolean' ? res.onboardingCompleted : true;
        this.postAuth.navigateAfterSession(role, onboardingDone);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        if (err instanceof HttpErrorResponse && err.status === 400) {
          const back = this.flow.afterMfaReturnPath();
          this.flow.clearMfa();
          void this.router.navigateByUrl(back);
          return;
        }
        this.error.set(true);
        if (this.errorClear) {
          window.clearTimeout(this.errorClear);
        }
        this.errorClear = window.setTimeout(() => this.error.set(false), 4000);
      },
    });
  }

  protected cancel(): void {
    const back = this.flow.afterMfaReturnPath();
    this.flow.clearMfa();
    void this.router.navigateByUrl(back);
  }
}
