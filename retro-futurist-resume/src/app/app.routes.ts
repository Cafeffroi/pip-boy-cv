import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: ':resumeId',
    loadComponent: () => import('./app.component').then((m) => m.AppComponent),
  },
  {
    path: '',
    loadComponent: () => import('./app.component').then((m) => m.AppComponent),
  },
];
