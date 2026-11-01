# Sa Gatonera – Frontend

Aplicació web d'adopció de gats de Sa Gatonera, una associació de Blanes dedicada a la protecció i cura dels gats. Inclou una àrea pública per consultar els gats en adopció i un _backoffice_ per a la gestió interna de l'associació. Forma part d'un Treball Final de Màster (Màster universitari en Desenvolupament de Llocs i Aplicacions Web, UOC).

Aquest repositori conté només el frontend. L'API és en un repositori independent: `sa-gatonera-backend`.

## Tecnologies

- Angular
- TypeScript
- SCSS
- Server-Side Rendering (SSR)

## Requisits

- Node.js 24
- npm
- El backend en funcionament

## Posada en marxa

1. Instal·lar les dependències:

   ```bash
   npm install
   ```

2. Comprovar que l'adreça de l'API als fitxers de `src/environments/` apunta al backend:

   ```text
   http://localhost:3000/api
   ```

3. Iniciar el servidor de desenvolupament:

   ```bash
   ng serve
   ```

L'aplicació estarà disponible a `http://localhost:4200`.

Per permetre la comunicació entre el frontend i el backend, la variable `FRONTEND_URL` del fitxer `.env` del backend ha de contenir `http://localhost:4200`.

## Comandes disponibles

| Comanda    | Descripció                            |
| ---------- | ------------------------------------- |
| `ng serve` | Inicia el servidor de desenvolupament |
| `ng build` | Compila l'aplicació                   |
