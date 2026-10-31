import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { Home } from './features/public/home/home';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [{ path: '', component: Home }],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'cats',
        loadComponent: () =>
          import('./features/admin/cats/cats').then((m) => m.Cats),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/admin/requests/requests').then((m) => m.Requests),
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./features/admin/news/news').then((m) => m.News),
      },
    ],
  },
];
