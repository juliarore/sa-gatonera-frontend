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
    path: 'collabora',
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
    path: 'avis-legal',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'politica-privacitat',
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
