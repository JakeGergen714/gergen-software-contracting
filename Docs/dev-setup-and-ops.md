## Dev Setup and Operations

### Prerequisites

- **Java**: JDK 17+ (for the Spring Boot backend).
- **Node.js + npm**: for the React/Vite frontend.
- **Docker + Docker Compose**: for running Postgres, Keycloak, API, and frontend together.

### Environment Configuration

- Backend and frontend both rely on environment variables.
- Typical pattern:
  - Copy `.env.example` (if present) to `.env` and adjust values for local dev.
  - Docker Compose sets key variables for containers; local runs can mirror these.
- Important variables (see `docker-compose.yml` and frontend config):
  - Backend:
    - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.
    - `KEYCLOAK_ISSUER_URI`.
    - `CORS_ALLOWED_ORIGINS` / `app.cors.allowed-origins`.
    - `DISABLE_AUTH` / `app.security.disable` (for local-only disabling of auth).
  - Frontend (Vite):
    - `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`.
    - `VITE_API_BASE_URL`.
    - `VITE_PORTAL_BUSINESS_ID` (business ID to load by default in the UI).

### Backend: Build and Test

From the repo root (`backend/pom.xml` exists at `backend/`):

```powershell
cd "C:\Users\jakeg\OneDrive\Documents\repos\gergen software contracting"
mvn -f backend/pom.xml clean package
mvn -f backend/pom.xml test
```

- `clean package` compiles the API and runs tests, producing a runnable JAR.
- `test` runs the test suite only.

### Frontend: Dev and Build

From the repo root, operate in the `frontend/` directory:

```powershell
cd "C:\Users\jakeg\OneDrive\Documents\repos\gergen software contracting\frontend"
npm install
npm run dev
# In another terminal
npm run build
```

- `npm run dev` starts the Vite dev server (default `http://localhost:5173`).
- `npm run build` produces a production build and effectively acts as a typecheck.

### Docker Compose

To run the full stack locally (Postgres + Keycloak + backend API + frontend dev container):

```powershell
cd "C:\Users\jakeg\OneDrive\Documents\repos\gergen software contracting"
docker compose up --build
```

- Services:
  - `postgres`: Postgres DB with persistent volume `pgdata`.
  - `keycloak`: Keycloak 25 in dev mode, importing realm from `keycloak/realm-export` and exposed on `localhost:8081`.
  - `api`: Backend API container built from `backend/Dockerfile`, exposed on `localhost:8080`.
  - `web`: Frontend dev container built from `frontend/Dockerfile`, running `npm run dev` on `localhost:5173`.

### Deployment Story (High-Level)

- **Backend**

  - Build JAR with Maven (`mvn -f backend/pom.xml clean package`).
  - Build Docker image with `backend/Dockerfile` (and optionally a production variant if present).

- **Frontend**

  - Build static assets with `npm run build`.
  - Build Docker image with `frontend/Dockerfile.prod` (for a production-ready Nginx-based container) or `frontend/Dockerfile` for dev.

- **Runtime**
  - Deploy containers to the target environment (e.g., Docker host, Kubernetes) using a compose-like stack.
  - Configure environment variables (DB, Keycloak URLs, CORS, Vite env) per environment.

## Dev Setup and Ops

### Prerequisites

- Java 17+ with Maven.
- Node.js 18+ with npm.
- Docker and Docker Compose.

### Environment configuration

- Backend reads configuration from `application.yml` and environment variables.
  - In Docker, `docker-compose.yml` sets:
    - `SPRING_DATASOURCE_*` for Postgres.
    - `KEYCLOAK_ISSUER_URI` for JWT validation.
    - `CORS_ALLOWED_ORIGINS` and `DISABLE_AUTH`.
- Frontend reads from Vite env vars (e.g. `VITE_API_BASE_URL`, `VITE_KEYCLOAK_URL`) defined in compose or a local `.env`.
- To create a `.env` for local frontend dev, copy any provided example (e.g. `.env.example` if present) or mirror the values from `docker-compose.yml`:
  - `VITE_KEYCLOAK_URL=http://localhost:8081`
  - `VITE_KEYCLOAK_REALM=client-portal`
  - `VITE_KEYCLOAK_CLIENT_ID=client-portal-web`
  - `VITE_API_BASE_URL=http://localhost:8080`
  - `VITE_PORTAL_BUSINESS_ID=<your test business UUID>`

### Backend build and tests

From the repo root:

```powershell
mvn -f backend/pom.xml clean package
mvn -f backend/pom.xml test
```

- The build compiles the Spring Boot app and runs unit/integration tests.
- Integration tests spin up a Postgres Testcontainer and run Flyway migrations.

### Frontend development and build

From `frontend/`:

```powershell
cd frontend
npm install
npm run dev
# or build for production
npm run build
```

- `npm run dev` starts Vite on port 5173.
- `npm run build` performs a production build and serves as a typecheck step.

### Running with Docker Compose

From the repo root:

```powershell
docker compose up --build
```

This will:

- Start Postgres (`postgres` service).
- Start Keycloak with the `client-portal` realm imported (`keycloak` service) on host port 8081.
- Build and run the Spring Boot API (`api` service) on port 8080.
- Build and run the frontend Vite dev server (`web` service) on port 5173 with hot reload.

You can then access the app at `http://localhost:5173`.

### Deployment overview

- **Backend:**
  - Build a JAR with Maven, then build a Docker image using `backend/Dockerfile`.
  - In production, configure `KEYCLOAK_ISSUER_URI`, DB connection, and `CORS_ALLOWED_ORIGINS` via environment variables.
- **Frontend:**
  - Build static assets with `npm run build` and package with `frontend/Dockerfile.prod`.
  - Serve via Nginx or another static file server, pointing `VITE_API_BASE_URL` at the deployed backend URL.
- **Orchestration:**
  - Use a Compose or Kubernetes manifest similar to `docker-compose.yml` to wire together backend, DB, Keycloak, and frontend.
