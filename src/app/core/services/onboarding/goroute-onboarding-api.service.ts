import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { GOROUTE_ENV, type GorouteEnvironment } from '../../config/app-environment';

export type OnboardingSchemaResponse = {
  steps: {
    id: string;
    title: string;
    description?: string;
    fields: { id: string; label: string; type: string; required?: boolean }[];
  }[];
};

@Injectable({ providedIn: 'root' })
export class GorouteOnboardingApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject<GorouteEnvironment>(GOROUTE_ENV);

  getSchema(): Observable<OnboardingSchemaResponse> {
    return this.http.get<OnboardingSchemaResponse>(`${this.env.apiBaseUrl}/onboarding/schema`);
  }

  skip(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.env.apiBaseUrl}/onboarding/skip`, {});
  }

  completeProfessional(body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.env.apiBaseUrl}/onboarding/complete`, body);
  }

  completeCompany(body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.env.apiBaseUrl}/onboarding/complete`, body);
  }
}
