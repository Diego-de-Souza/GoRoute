import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GOROUTE_ENV, type GorouteEnvironment } from '../../config/app-environment';

export type GorouteMeUser = {
  id: string;
  email: string;
  role: 'professional' | 'company';
  companyName?: string | null;
};

export type GorouteMeResponse = {
  user: GorouteMeUser;
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
};

@Injectable({ providedIn: 'root' })
export class GorouteRestApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject<GorouteEnvironment>(GOROUTE_ENV);

  /** Current user resolved by goroute-api using goroute-service-auth session validation. */
  getMe(): Observable<GorouteMeResponse> {
    return this.http.get<GorouteMeResponse>(`${this.env.apiBaseUrl}/me`);
  }
}
