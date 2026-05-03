import { Injectable, signal } from '@angular/core';

export type SocialProvider = 'google' | 'github' | 'apple';

@Injectable({ providedIn: 'root' })
export class LoginFlowService {
  /** Shown on the MFA step (masked in the template). */
  readonly pendingMfaEmail = signal<string | null>(null);

  /** Issued by goroute-service-auth when `mfaRequired` is true; consumed by `POST /mfa/verify`. */
  readonly pendingMfaTempToken = signal<string | null>(null);

  /**
   * Route to return when MFA is cancelled, invalid, or guard blocks `/login/mfa`
   * (e.g. `/login` vs `/login/empresa`).
   */
  readonly afterMfaReturnPath = signal<string>('/login');

  beginMfa(email: string, tempToken: string, returnPath = '/login'): void {
    this.pendingMfaEmail.set(email.trim());
    this.pendingMfaTempToken.set(tempToken);
    this.afterMfaReturnPath.set(returnPath);
  }

  clearMfa(): void {
    this.pendingMfaEmail.set(null);
    this.pendingMfaTempToken.set(null);
    this.afterMfaReturnPath.set('/login');
  }

  /** Placeholder until OAuth backends exist — resolves after a short delay. */
  startSocialLogin(provider: SocialProvider): Promise<SocialProvider> {
    void provider;
    return new Promise((resolve) => window.setTimeout(() => resolve(provider), 650));
  }
}
