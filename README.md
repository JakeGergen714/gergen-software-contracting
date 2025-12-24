# Client Portal MVP (Projects + Backlog/Approvals)

This monorepo contains:

- backend/ — Spring Boot API (Java 21, PostgreSQL, Flyway, Keycloak JWT)
- portal/ — React + Vite + Tailwind SPA (Keycloak auth) - The Client Portal
- website/ — React + Vite + Tailwind SPA - The Public Marketing Site
- docker-compose.yml — Dev stack: Postgres, Keycloak, API, Portal, Website
- keycloak/realm-export — Realm JSON with roles, clients, demo users

Quickstart (dev):

1. Copy `portal/.env.example` → `portal/.env` (override URLs/client IDs if you run on something other than localhost)
2. Build + launch all services with Docker Compose

Windows PowerShell:

```powershell
# Build and start
docker compose up --build
```

Services:

- Postgres: localhost:5432 (postgres/postgres)
- Keycloak: http://localhost:8081 (admin/admin) — realm + demo data auto-imported
- API: http://localhost:8080 (auth enforced, JWTs from Keycloak)
- Portal: http://localhost:5173 (Vite dev server inside Docker)
- Website: http://localhost:5174 (Vite dev server inside Docker)

Portal demo users (Keycloak realm `client-portal`):

- admin@example.com / admin (ROLE_ADMIN)
- lead@example.com / lead (ROLE_CLIENT_OWNER)
- client@example.com / client (ROLE_CLIENT_MEMBER)

Keycloak realm auto-imports on first start.

API docs: http://localhost:8080/swagger-ui/index.html

Notes:

- Seed data inserts placeholder Keycloak user IDs (emails). For real per-project checks, map actual Keycloak subject IDs after login.
- Emails are disabled by default (Spring Mail points at localhost). Configure SMTP in env vars to send.
- `docker-compose.yml` now runs the API with auth enabled (`DISABLE_AUTH=false`). If you need anonymous access during debugging, override that env.

## 🔧 Configuration Reference

| Component | Variable                                                    | Default                                         | Purpose                                                            |
| --------- | ----------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| backend   | `SPRING_DATASOURCE_URL`                                     | `jdbc:postgresql://postgres:5432/client_portal` | JDBC connection inside Docker                                      |
| backend   | `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | `postgres`                                      | DB credentials                                                     |
| backend   | `KEYCLOAK_ISSUER_URI`                                       | `http://keycloak:8080/realms/client-portal`     | Internal issuer for JWT validation                                 |
| backend   | `CORS_ALLOWED_ORIGINS`                                      | `http://localhost:5173`                         | Browser origins allowed to hit the API                             |
| backend   | `DISABLE_AUTH`                                              | `false`                                         | Toggles DevSecurityConfig (should remain false except for testing) |
| portal    | `VITE_API_BASE_URL`                                         | `http://localhost:8080`                         | Root API URL (no trailing slash)                                   |
| portal    | `VITE_KEYCLOAK_URL`                                         | `http://localhost:8081`                         | Browser-facing Keycloak base URL                                   |
| portal    | `VITE_KEYCLOAK_REALM`                                       | `client-portal`                                 | Realm to use                                                       |
| portal    | `VITE_KEYCLOAK_CLIENT_ID`                                   | `client-portal-web`                             | Public SPA client                                                  |
| portal    | `VITE_PORTAL_BUSINESS_ID`                                   | `11111111-1111-1111-1111-111111111111`          | Business UUID that matches backend seed data                       |

Set the Vite variables either via `portal/.env` (local dev) or Docker env/ARGs. The docker-compose definition already provides sane defaults for running the whole stack on localhost.

## 🧭 Browser end-to-end tests (Playwright)

Requirements

1. Stack running locally (`docker compose up --build`) so the SPA, API, Keycloak, and Postgres are reachable.
2. Copy `portal/.env.e2e.example` → `portal/.env.e2e` if you change demo credentials or hostnames.
3. Install Playwright browser binaries once per machine: `npx playwright install` (run from `portal/`).

Run headless tests from the repo root:

```powershell
# Execute from the repo root
docker compose up --build -d
npm --prefix portal install
npx --prefix portal playwright install   # first run only
npm --prefix portal run test:e2e
```

Debug options:

- `npm --prefix portal run test:e2e -- --headed --project=chromium`
- `npm --prefix portal run test:e2e:ui` to open Playwright Test Runner
- Traces/screenshots live under `portal/test-results/` after each run

Tests currently automate Keycloak SSO (admin + client demo users) and then assert the relevant workspace renders. They will fail until the underlying auth/integration issue is resolved, giving you fast feedback each time you tweak the stack.

License: MIT

## 🧪 How to get an admin token (for API testing)

During dev you might want to hit the API directly as the admin user without going through the browser. Here’s the exact sequence we used on Windows PowerShell to obtain a token from Keycloak and call the API.

Prereqs

- Dev stack is running (`docker compose up -d`)
- Keycloak is available at http://localhost:8081
- Realm: `client-portal`
- Public client: `client-portal-web` (direct access grant enabled)
- Admin user: `admin@example.com` / `admin`

Windows PowerShell (copy/paste)

```powershell
# 1) Request an access token via password grant
$body = @{
	client_id = 'client-portal-web'
	grant_type = 'password'
	username = 'admin@example.com'
	password = 'admin'
}
$r = Invoke-RestMethod -Method Post `
	-Uri 'http://localhost:8081/realms/client-portal/protocol/openid-connect/token' `
	-ContentType 'application/x-www-form-urlencoded' `
	-Body $body

# 2) Store the bearer token
$bearer = $r.access_token

# 3) Call the API (list projects)
Invoke-RestMethod -Method Get `
	-Uri 'http://localhost:8080/api/projects' `
	-Headers @{ Authorization = "Bearer $bearer" } |
	ConvertTo-Json -Compress | Write-Output

# 4) Call a project detail endpoint (replace with a real ID if needed)
$list = Invoke-RestMethod -Method Get `
	-Uri 'http://localhost:8080/api/projects' `
	-Headers @{ Authorization = "Bearer $bearer" }
$firstId = $list[0].id
Invoke-RestMethod -Method Get `
	-Uri ("http://localhost:8080/api/projects/" + $firstId) `
	-Headers @{ Authorization = "Bearer $bearer" } |
	ConvertTo-Json -Compress | Write-Output
```

Alternative (curl)

```bash
# Access token
curl -s -X POST \
	-H 'Content-Type: application/x-www-form-urlencoded' \
	-d 'client_id=client-portal-web&grant_type=password&username=admin@example.com&password=admin' \
	http://localhost:8081/realms/client-portal/protocol/openid-connect/token | jq -r .access_token

# Use the token (replace $TOKEN)
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/projects | jq .
```

Troubleshooting

- If a detail endpoint returns 500 with a message about `-parameters` flag, ensure the API image is rebuilt (we explicitly annotated @PathVariable names to avoid this, but rebuild if you’re on an old image):
  - `docker compose build api --no-cache && docker compose up -d api`
- If Keycloak isn’t ready yet, the token request will fail; wait a few seconds and retry.
