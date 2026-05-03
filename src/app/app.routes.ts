import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',
    title: 'Home',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)

  },
  { path: 'about',
    title: 'About',
    loadComponent: () => import('./pages/about/about').then(m => m.About)
  },
  { 
    path: 'login',
    loadChildren: () => import('./pages/login/login.routes').then(m => m.loginRoutes)
  },
  {
    path: 'onboarding',
    title: 'Onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding').then((m) => m.Onboarding),
  },
  {
    path: 'dashboard/personal',
    title: 'Dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-personal').then((m) => m.DashboardPersonal),
  },
  {
    path: 'dashboard/company',
    title: 'Dashboard empresa',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-company').then((m) => m.DashboardCompany),
  },
  { path: '**', redirectTo: '' },
];
