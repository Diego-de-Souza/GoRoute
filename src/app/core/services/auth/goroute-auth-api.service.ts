import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, tap, type Observable } from 'rxjs';
import { GOROUTE_ENV, type GorouteEnvironment } from '../../config/app-environment';
import { GorouteMapperApiContextService } from './goroute-mapper-api-context.service';

export type GorouteAuthLoginResponse = {
  mfaRequired: boolean;
  tempToken?: string;
  sessionIssued: boolean;
  role?: 'professional' | 'company';
  onboardingCompleted?: boolean;
};

export type GorouteAuthRegisterResponse = {
  userId: string;
};

@Injectable({ providedIn: 'root' })
export class GorouteAuthApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject<GorouteEnvironment>(GOROUTE_ENV);
  private readonly mapperContext = inject(GorouteMapperApiContextService);

  login(email: string, password: string): Observable<GorouteAuthLoginResponse> {
    return this.http
      .post<GorouteAuthLoginResponse>(
        `${this.env.authBaseUrl}/login`,
        { email, password },
        {
          observe: 'response',
          headers: { 'X-Application-From': this.env.applicationFrom },
        },
      )
      .pipe(
        tap((res) => {
          const h = res.headers.get('x-mapper-api');
          if (h) {
            this.mapperContext.captureFromHeaders(res.headers);
          } else if (res.body?.sessionIssued) {
            this.mapperContext.clear();
          }
        }),
        map((res) => {
          const body = res.body;
          if (!body) {
            throw new Error('Login response without body');
          }
          return body;
        }),
      );
  }

  verifyMfa(
    tempToken: string,
    code: string,
  ): Observable<{ ok: boolean; role?: 'professional' | 'company'; onboardingCompleted?: boolean }> {
    return this.http
      .post<{
        ok: boolean;
        role?: 'professional' | 'company';
        onboardingCompleted?: boolean;
      }>(
        `${this.env.authBaseUrl}/mfa/verify`,
        { tempToken, code },
        {
          observe: 'response',
          headers: { 'X-Application-From': this.env.applicationFrom },
        },
      )
      .pipe(
        tap((res) => {
          const h = res.headers.get('x-mapper-api');
          if (h) {
            this.mapperContext.captureFromHeaders(res.headers);
          } else {
            this.mapperContext.clear();
          }
        }),
        map((res) => {
          const body = res.body;
          if (!body) {
            throw new Error('MFA verify response without body');
          }
          return body;
        }),
      );
  }

  register(
    email: string,
    password: string,
    role: 'professional' | 'company',
    companyName?: string,
  ): Observable<GorouteAuthRegisterResponse> {
    const body: Record<string, unknown> = { email, password, role };
    if (role === 'company' && companyName) {
      body['companyName'] = companyName;
    }
    return this.http.post<GorouteAuthRegisterResponse>(
      `${this.env.authBaseUrl}/register`,
      body,
      { headers: { 'X-Application-From': this.env.applicationFrom } },
    );
  }
}
