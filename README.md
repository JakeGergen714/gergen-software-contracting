# Client Portal MVP (Projects + Backlog/Approvals)

This monorepo contains:

- backend/ — Spring Boot API (Java 21, PostgreSQL, Flyway, Keycloak JWT)
- frontend/ — React + Vite + Tailwind SPA (Keycloak auth)
- docker-compose.yml — Dev stack: Postgres, Keycloak, API, Web
- keycloak/realm-export — Realm JSON with roles, clients, demo users

Quickstart (dev):

1. Copy .env.example to .env and adjust if needed
2. Run with Docker Compose

Windows PowerShell:

```powershell
# Build and start
docker compose up --build
```

Services:

- Postgres: localhost:5432 (postgres/postgres)
- Keycloak: http://localhost:8081 (admin/admin)
- API: http://localhost:8080
- Web: http://localhost:5173

Login with demo users:

- admin@example.com / admin
- lead@example.com / lead
- client@example.com / client

Keycloak realm auto-imports on first start.

API docs: http://localhost:8080/swagger-ui/index.html

Notes:

- Seed data inserts placeholder Keycloak user IDs (emails). For real per-project checks, map actual Keycloak subject IDs after login.
- Emails are disabled by default (Spring Mail points at localhost). Configure SMTP in env vars to send.

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
