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
        data: { title: 'Panell de control' },
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'cats',
        data: { title: 'Gats' },
        loadComponent: () =>
          import('./features/admin/cats/cats').then((m) => m.Cats),
      },
      {
        path: 'requests',
        data: { title: "Sol·licituds d'adopció" },
        loadComponent: () =>
          import('./features/admin/requests/requests').then((m) => m.Requests),
      },
      {
        path: 'news',
        data: { title: 'Publicacions' },
        loadComponent: () =>
          import('./features/admin/news/news').then((m) => m.News),
      },
    ],
  },
];
