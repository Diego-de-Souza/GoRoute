import { InjectionToken } from '@angular/core';

export type GorouteEnvironment = {
  production: boolean;
  /** Base URL for goroute-service-auth (e.g. `/goroute-auth` behind dev proxy). */
  authBaseUrl: string;
  /** Base URL for goroute-api (global prefix already `/api` on the server — use `/api` here). */
  apiBaseUrl: string;
  /** Sent as `X-Application-From` on auth requests (hashed context for map API key in auth service). */
  applicationFrom: string;
};

export const GOROUTE_ENV = new InjectionToken<GorouteEnvironment>('GOROUTE_ENV');
