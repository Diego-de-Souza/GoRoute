import type { GorouteEnvironment } from '../app/core/config/app-environment';

export const environment: GorouteEnvironment = {
  production: false,
  authBaseUrl: '/goroute-auth',
  apiBaseUrl: '/api',
  applicationFrom: 'goroute-web',
};
