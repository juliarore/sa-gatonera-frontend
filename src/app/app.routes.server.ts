import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'adopta/gats-adopcio',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'adopta/troba-el-teu-company',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'adopta/proces-adopcio',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'adopta/condicions-adopcio',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'collabora/donacions',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'collabora/voluntariat',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'collabora/socis',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'actualitat',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'sobre-nosaltres',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'contacte',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'admin/cats/create',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/cats/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
