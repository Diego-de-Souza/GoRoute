import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export type PlatformRole = 'professional' | 'company';

@Injectable({ providedIn: 'root' })
export class PostAuthNavigationService {
  private readonly router = inject(Router);

  navigateAfterSession(role: PlatformRole, onboardingCompleted: boolean): void {
    if (!onboardingCompleted) {
      void this.router.navigate(['/onboarding']);
      return;
    }
    void this.router.navigate(
      role === 'company' ? ['/dashboard/company'] : ['/dashboard/personal'],
    );
  }
}
