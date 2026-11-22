import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        title: 'Inici | Sa Gatonera',
        data: { title: 'Inici' },
        loadComponent: () => import('./views/public/home/home').then((m) => m.Home),
      },
      { path: 'adopta', redirectTo: 'adopta/gats-adopcio', pathMatch: 'full' },
      {
        path: 'adopta/gats-adopcio',
        title: 'Gats en adopció | Sa Gatonera',
        data: { title: 'Gats en adopció' },
        loadComponent: () => import('./views/public/adopt/catalog/catalog').then((m) => m.Catalog),
      },
      {
        path: 'adopta/troba-el-teu-company',
        title: 'Troba el teu company de vida | Sa Gatonera',
        data: { title: 'Troba el teu company de vida' },
        loadComponent: () => import('./views/public/adopt/compatibility-quiz/compatibility-quiz').then((m) => m.CompatibilityQuiz),
      },
      {
        path: 'adopta/proces-adopcio',
        title: "Procés d'adopció | Sa Gatonera",
        data: { title: "Procés d'adopció" },
        loadComponent: () => import('./views/public/adopt/process/process').then((m) => m.Process),
      },
      {
        path: 'adopta/condicions-adopcio',
        title: "Condicions d'adopció | Sa Gatonera",
        data: { title: "Condicions d'adopció" },
        loadComponent: () => import('./views/public/adopt/conditions/conditions').then((m) => m.Conditions),
      },
      {
        path: 'collabora',
        title: 'Col·labora | Sa Gatonera',
        data: { title: 'Col·labora' },
        loadComponent: () => import('./views/public/collaborate/collaborate').then((m) => m.CollaboratePage),
      },
      {
        path: 'actualitat',
        title: 'Actualitat | Sa Gatonera',
        data: { title: 'Actualitat' },
        loadComponent: () => import('./views/public/news/news').then((m) => m.News),
      },
      {
        path: 'sobre-nosaltres',
        title: 'Sobre nosaltres | Sa Gatonera',
        data: { title: 'Sobre nosaltres' },
        loadComponent: () => import('./views/public/about/about').then((m) => m.About),
      },
      {
        path: 'contacte',
        title: 'Contacte | Sa Gatonera',
        data: { title: 'Contacte' },
        loadComponent: () => import('./views/public/contact/contact').then((m) => m.Contact),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        title: 'Panell de control | Sa Gatonera',
        data: { title: 'Panell de control' },
        loadComponent: () => import('./views/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'cats',
        title: 'Gestió dels gats | Sa Gatonera',
        data: { title: 'Gestió dels gats' },
        loadComponent: () => import('./views/admin/cats/cats').then((m) => m.Cats),
      },
      {
        path: 'cats/create',
        title: 'Crear gat | Sa Gatonera',
        data: { title: 'Crear gat' },
        loadComponent: () => import('./views/admin/cat-create/cat-create').then((m) => m.CatCreate),
      },
      {
        path: 'cats/:id',
        title: 'Detall del gat | Sa Gatonera',
        data: { title: 'Detall del gat' },
        loadComponent: () => import('./views/admin/cat-detail/cat-detail').then((m) => m.CatDetail),
      },
      {
        path: 'requests',
        title: "Sol·licituds d'adopció | Sa Gatonera",
        data: { title: "Sol·licituds d'adopció" },
        loadComponent: () => import('./views/admin/requests/requests').then((m) => m.Requests),
      },
      {
        path: 'news',
        title: 'Publicacions | Sa Gatonera',
        data: { title: 'Publicacions' },
        loadComponent: () => import('./views/admin/news/news').then((m) => m.News),
      },
    ],
  },
];
