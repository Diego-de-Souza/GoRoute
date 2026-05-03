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
  companyName?: string | null;
};

/** User register returns `userId`; company register returns `companyId`. */
export type GorouteAuthRegisterResponse = {
  userId?: string;
  companyId?: string;
};

@Injectable({ providedIn: 'root' })
export class GorouteAuthApiService {
  private readonly http = inject(HttpClient);
  private readonly env = inject<GorouteEnvironment>(GOROUTE_ENV);
  private readonly mapperContext = inject(GorouteMapperApiContextService);

  login(email: string, password: string): Observable<GorouteAuthLoginResponse> {
    return this.loginPost(`${this.env.authBaseUrl}/users/login`, { email, password });
  }

  /**
   * Company web login: `/companies/login` with `mobileAppKey` from the GoRoute mobile app
   * (backend validates the pairing key together with email and password).
   */
  loginCompany(email: string, password: string, mobileAppKey: string): Observable<GorouteAuthLoginResponse> {
    return this.loginPost(`${this.env.authBaseUrl}/companies/login`, {
      email,
      password,
      mobileAppKey: mobileAppKey.trim(),
    });
  }

  private loginPost(url: string, body: Record<string, unknown>): Observable<GorouteAuthLoginResponse> {
    return this.http
      .post<GorouteAuthLoginResponse>(url, body, {
        observe: 'response',
        headers: { 'X-Application-From': this.env.applicationFrom },
      })
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
          const b = res.body;
          if (!b) {
            throw new Error('Login response without body');
          }
          return b;
        }),
      );
  }

  verifyMfa(
    tempToken: string,
    code: string,
  ): Observable<{
    ok: boolean;
    role?: 'professional' | 'company';
    onboardingCompleted?: boolean;
    companyName?: string | null;
  }> {
    return this.http
      .post<{
        ok: boolean;
        role?: 'professional' | 'company';
        onboardingCompleted?: boolean;
        companyName?: string | null;
      }>(
        `${this.env.authBaseUrl}/users/mfa/verify`,
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

  registerUser(email: string, password: string): Observable<GorouteAuthRegisterResponse> {
    return this.http.post<GorouteAuthRegisterResponse>(
      `${this.env.authBaseUrl}/users/register`,
      { email, password },
      { headers: { 'X-Application-From': this.env.applicationFrom } },
    );
  }

  registerCompany(
    email: string,
    password: string,
    companyName: string,
    cnpj?: string,
  ): Observable<GorouteAuthRegisterResponse> {
    const body: Record<string, unknown> = { email, password, companyName };
    if (cnpj?.trim()) {
      body['cnpj'] = cnpj.trim();
    }
    return this.http.post<GorouteAuthRegisterResponse>(
      `${this.env.authBaseUrl}/companies/register`,
      body,
      { headers: { 'X-Application-From': this.env.applicationFrom } },
    );
  }
}
