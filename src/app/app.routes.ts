import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { Home } from './views/public/home/home';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [{ path: '', title: 'Sa Gatonera', component: Home }],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        title: 'Panell de control | Sa Gatonera',
        data: { title: 'Panell de control' },
        loadComponent: () =>
          import('./views/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'cats',
        title: 'Gestió dels gats | Sa Gatonera',
        data: { title: 'Gestió dels gats' },
        loadComponent: () =>
          import('./views/admin/cats/cats').then((m) => m.Cats),
      },
      {
        path: 'requests',
        title: "Sol·licituds d'adopció | Sa Gatonera",
        data: { title: "Sol·licituds d'adopció" },
        loadComponent: () =>
          import('./views/admin/requests/requests').then((m) => m.Requests),
      },
      {
        path: 'news',
        title: 'Publicacions | Sa Gatonera',
        data: { title: 'Publicacions' },
        loadComponent: () =>
          import('./views/admin/news/news').then((m) => m.News),
      },
    ],
  },
];
