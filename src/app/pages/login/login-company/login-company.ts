import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { GorouteAuthApiService } from '../../../core/services/auth/goroute-auth-api.service';
import { GorouteMapperApiContextService } from '../../../core/services/auth/goroute-mapper-api-context.service';
import { LoginFlowService } from '../../../core/services/login/login-flow.service';
import { PostAuthNavigationService } from '../../../core/services/login/post-auth-navigation.service';

@Component({
  selector: 'app-login-company',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './login-company.html',
  styleUrl: './login-company.scss',
})
export class LoginCompany implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly flow = inject(LoginFlowService);
  private readonly authApi = inject(GorouteAuthApiService);
  private readonly mapperContext = inject(GorouteMapperApiContextService);
  private readonly postAuth = inject(PostAuthNavigationService);

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly banner = signal<{ kind: 'info' | 'err' | 'pending'; text: string } | null>(null);

  private bannerClear?: number;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    mobileAppKey: ['', [Validators.required, Validators.minLength(4)]],
    remember: [true],
  });

  ngOnDestroy(): void {
    if (this.bannerClear) {
      window.clearTimeout(this.bannerClear);
    }
  }

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const { email, password, mobileAppKey } = this.form.getRawValue();
    this.submitting.set(true);
    this.banner.set(null);

    this.authApi.loginCompany(email, password, mobileAppKey).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.mfaRequired && res.tempToken) {
          this.flow.beginMfa(email, res.tempToken, '/login/empresa');
          void this.router.navigate(['/login/mfa']);
          return;
        }
        if (res.sessionIssued) {
          this.flow.clearMfa();
          const role = res.role ?? 'professional';
          const onboardingDone =
            typeof res.onboardingCompleted === 'boolean' ? res.onboardingCompleted : true;
          this.postAuth.navigateAfterSession(role, onboardingDone);
          return;
        }
        this.flashBanner('err', 'LOGIN.ERR_LOGIN_COMPANY');
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.mapperContext.clear();
          this.flashBanner('err', 'LOGIN.ERR_LOGIN_COMPANY');
          return;
        }
        if (err instanceof HttpErrorResponse && err.status === 429) {
          this.flashBanner('err', 'LOGIN.ERR_RATE_LIMIT');
          return;
        }
        this.flashBanner('err', 'LOGIN.ERR_NETWORK');
      },
    });
  }

  private flashBanner(kind: 'info' | 'err' | 'pending', translateKey: string): void {
    if (this.bannerClear) {
      window.clearTimeout(this.bannerClear);
    }
    this.banner.set({ kind, text: translateKey });
    if (kind !== 'err') {
      this.bannerClear = window.setTimeout(() => this.banner.set(null), 5200);
    }
  }
}
