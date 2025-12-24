# Frontend: Dev vs Production

This app uses Vite + React.

- Development: `Dockerfile` (target `dev`) runs `npm run dev` (Vite dev server). It binds to `0.0.0.0` for container networking and uses polling-based file watching for reliable HMR under Docker.
- Production: Use the same multistage `Dockerfile` with target `prod` to build static assets and serve via Nginx with SPA routing.

## Dev (inside Docker)

- Compose service `web` runs `npm run dev -- --host 0.0.0.0` and exposes port 5173.

## Production build

```
docker build --target prod -t gergen-frontend:prod .
docker run -p 8085:80 gergen-frontend:prod
```

Open http://localhost:8085

Notes:

- `0.0.0.0` host binding is only for development servers in containers. In production we serve static assets with Nginx; no dev server runs there.
- `nginx.conf` includes an SPA fallback so client-side routes (e.g. `/portal/projects`) resolve to `index.html`.
