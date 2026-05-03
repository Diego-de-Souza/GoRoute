import type { GorouteEnvironment } from '../app/core/config/app-environment';

/** Replace with absolute URLs if the SPA and APIs are on different hosts (configure CORS and cookie domain accordingly). */
export const environment: GorouteEnvironment = {
  production: true,
  authBaseUrl: '/goroute-auth',
  apiBaseUrl: '/api',
  applicationFrom: 'goroute-web',
};
