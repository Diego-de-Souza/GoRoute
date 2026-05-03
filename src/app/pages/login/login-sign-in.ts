import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { GorouteAuthApiService } from '../../core/services/auth/goroute-auth-api.service';
import { GorouteMapperApiContextService } from '../../core/services/auth/goroute-mapper-api-context.service';
import { PostAuthNavigationService } from '../../core/services/login/post-auth-navigation.service';
import { LoginFlowService, type SocialProvider } from '../../core/services/login/login-flow.service';

@Component({
  selector: 'app-login-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './login-sign-in.html',
  styleUrl: './login-sign-in.scss',
})
export class LoginSignIn implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly flow = inject(LoginFlowService);
  private readonly authApi = inject(GorouteAuthApiService);
  private readonly mapperContext = inject(GorouteMapperApiContextService);
  private readonly postAuth = inject(PostAuthNavigationService);

  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly socialBusy = signal<SocialProvider | null>(null);
  protected readonly banner = signal<{ kind: 'info' | 'err' | 'pending'; text: string } | null>(null);

  private bannerClear?: number;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [true],
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('welcome') === '1') {
      this.flashBanner('info', 'LOGIN.SUCCESS_REGISTER');
    }
  }

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

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.banner.set(null);

    this.authApi.login(email, password).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.mfaRequired && res.tempToken) {
          this.flow.beginMfa(email, res.tempToken, '/login');
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
        this.flashBanner('err', 'LOGIN.ERR_LOGIN');
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.mapperContext.clear();
          this.flashBanner('err', 'LOGIN.ERR_LOGIN');
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

  protected async social(provider: SocialProvider): Promise<void> {
    this.socialBusy.set(provider);
    this.banner.set(null);
    try {
      await this.flow.startSocialLogin(provider);
      this.flashBanner('pending', 'LOGIN.SOCIAL_PENDING');
    } finally {
      this.socialBusy.set(null);
    }
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
