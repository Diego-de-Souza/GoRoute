import { Routes } from '@angular/router';

import { loginMfaGuard } from '../../core/guard/login-mfa.guard';

export const loginRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login-shell/login-shell').then((m) => m.LoginShell),
    children: [
      {
        path: '',
        title: 'Login',
        loadComponent: () => import('./login-sign-in').then((m) => m.LoginSignIn),
      },
      {
        path: 'empresa',
        title: 'Login empresa',
        loadComponent: () => import('./login-company/login-company').then((m) => m.LoginCompany),
      },
      {
        path: 'register',
        title: 'Register',
        loadComponent: () => import('./login-register/login-register').then((m) => m.LoginRegister),
      },
      {
        path: 'mfa',
        title: 'Two-factor authentication',
        canActivate: [loginMfaGuard],
        loadComponent: () => import('./login-mfa/login-mfa').then((m) => m.LoginMfa),
      },
    ],
  },
];
