## Auth and Security

### Keycloak Realm and Clients

- Realm export lives at `keycloak/realm-export/client-portal-realm.json`.
- Realm: **client-portal**.
- Typical client configuration:
  - Backend uses the realm as an OAuth2 resource server (JWT bearer tokens) via `spring.security.oauth2.resourceserver.jwt.issuer-uri`.
  - Frontend uses a public client (e.g., `client-portal-web`) configured in `.env` / Docker env (`VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`).
- Roles are defined as Keycloak realm roles (e.g., `CLIENT_OWNER`, `CLIENT_MEMBER`, `ADMIN`) and propagated as authorities in the JWT.

### Spring Security Configuration

- Implemented in `backend/src/main/java/com/gergen/portal/config/SecurityConfig.java`.
- Key characteristics:
  - Stateless JWT resource server (no sessions, CSRF disabled).
  - Public endpoints:
    - `GET /actuator/health`
    - `GET /api/ping`
    - OpenAPI/Swagger docs: `/v3/api-docs/**`, `/swagger-ui.html`, `/swagger-ui/**`.
  - All other endpoints require a valid JWT access token.
  - CORS:
    - Allowed origins from `app.cors.allowed-origins` (e.g., `http://localhost:5173`).
    - Methods: `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS`.
    - Headers: `Authorization`, `Content-Type`, `X-Requested-With`.

#### JWT Decoding and Issuer Validation

- `JwtDecoder` is configured to:
  - Fetch JWKs from the Keycloak issuer (`/protocol/openid-connect/certs`).
  - Validate standard claims (expiration, not-before, etc.).
  - Accept tokens whose `iss` matches any value in `app.security.accepted-issuers` (defaults to both container and localhost Keycloak URLs).

#### Role Mapping

- `KeycloakRealmRoleConverter` maps Keycloak realm roles into Spring Security authorities.
- `SecurityConfig` wires this converter into a `JwtAuthenticationConverter` so controllers and services can use role-based checks (e.g., `hasRole('ADMIN')`) if needed.

### Frontend Auth Flow

- **Configuration**

  - Environment variables (`VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`) drive Keycloak client setup in the frontend.

- **AuthContext** (`frontend/src/context/AuthContext.tsx`)

  - Holds the current `UserSession` (`token`, `user`, `business`).
  - Provides login/logout helpers and exposes the active token for API calls.

- **ProtectedRoute** (`frontend/src/routes/ProtectedRoute.tsx`)

  - Wraps authenticated sections of the router: `/business/**` and `/admin/**`.
  - If no session/token is present, redirects to `/login` (or an appropriate public route).

- **HTTP Client Integration** (`frontend/src/services/httpClient.ts`)
  - Centralized Axios/fetch wrapper that injects the Bearer token from `AuthContext` into `Authorization` headers for API calls.
  - All service methods (`ProjectService`, `BusinessService`, `AuthService`) use this client to talk to the backend.

### Roles and Views

- **Client/Business users** (`CLIENT_OWNER`, `CLIENT_MEMBER`)

  - Primary experience under `/business/**`.
  - Can see their business projects, roadmap, backlog, schedule, and operations views via pages in `frontend/src/pages/business/**`.

- **Admin users** (`ADMIN`)
  - Admin workspace under `/admin/**`.
  - Access to project-level admin views (epics management, sprint planning/execution/retro, admin backlog) via `frontend/src/pages/admin/**`.

### Local Dev Auth Options

- Local Keycloak is started by `docker-compose.yml` (`keycloak` service on `localhost:8081`).
- Backend can be configured with `DISABLE_AUTH` / `app.security.disable` for simplified local testing, but production setups should keep auth enabled and rely on Keycloak.

## Auth and Security

### Keycloak realm and clients

- Keycloak is started by Docker Compose from `quay.io/keycloak/keycloak:25.0` with realm imports mounted from `keycloak/realm-export`.
- The primary realm is `client-portal` (see `keycloak/realm-export/client-portal-realm.json`).
- The frontend uses an OIDC client (e.g. `client-portal-web`) configured for SPA flows with redirect URIs pointing at the Vite dev server or deployed host.
- Roles are modeled as realm roles, which are mapped into Spring Security authorities via `KeycloakRealmRoleConverter`.

### Spring Security configuration

#### Production mode (`SecurityConfig`)

Located at `backend/src/main/java/com/gergen/portal/config/SecurityConfig.java`.

- Enabled when `app.security.disable=false` (default).
- Stateless resource server using JWT access tokens from Keycloak:
  - `spring.security.oauth2.resourceserver.jwt.issuer-uri` points to the Keycloak realm.
  - A custom `JwtDecoder` validates standard claims and accepts issuers from `app.security.accepted-issuers` to support both container‑internal (`http://keycloak:8080/...`) and host‑mapped (`http://localhost:8081/...`) URLs.
- Authorization rules:
  - `GET /actuator/health` and `GET /api/ping` are public.
  - OpenAPI/Swagger endpoints (`/v3/api-docs/**`, `/swagger-ui*`) are public.
  - All other endpoints require authentication.
- CORS configuration:
  - Allowed origins come from `app.cors.allowed-origins` (wired from the `CORS_ALLOWED_ORIGINS` env var in `docker-compose.yml`).
  - Allows standard HTTP methods and headers plus credentials.
- Role mapping:
  - `KeycloakRealmRoleConverter` turns Keycloak realm roles into Spring authorities (e.g. `ROLE_ADMIN`, `ROLE_CLIENT_OWNER`).

#### Dev mode (`DevSecurityConfig`)

Located at `backend/src/main/java/com/gergen/portal/config/DevSecurityConfig.java`.

- Enabled when `app.security.disable=true`.
- Disables CSRF, permits all requests, and configures CORS similarly to production.
- Installs a `StubAuthFilter` that injects a synthetic authenticated user with authority `ROLE_ADMIN` so that controllers relying on an `Authentication` object can still function during local development without Keycloak.

### Frontend authentication flow

#### Services and contexts

- `AuthService` / `KeycloakAuthService` (`frontend/src/services/AuthService.ts`)
  - Wraps Keycloak’s JS/OIDC client.
  - Provides methods like `login`, `signup`, `logout`, `getSession`, and `getAccessToken`.
- `ServiceContext` (`frontend/src/context/ServiceContext.tsx`)
  - Provides a `ServiceRegistry` with `auth`, `business`, and `project` services.
  - Uses `HttpClient` (`frontend/src/services/httpClient.ts`) to send API requests with `Authorization: Bearer <token>` obtained from `auth.getAccessToken()`.
- `AuthContext` (`frontend/src/context/AuthContext.tsx`)
  - Manages the `UserSession` (token, user, business) for the currently logged‑in user.
  - On mount, calls `auth.getSession()` to restore an existing session from Keycloak.
  - Exposes `login`, `signup`, and `logout` functions that delegate to `AuthService` then refresh the session.

#### Routing protection

- `ProtectedRoute` (`frontend/src/routes/ProtectedRoute.tsx`)
  - Wraps route elements and checks `AuthContext`.
  - If `loading`, it renders a loading state; if unauthenticated, it redirects to the login/signup flow; otherwise it renders the requested page.
- Admin‑only sections use the user’s `role` from `UserSession.user.role` (`CLIENT_OWNER`, `CLIENT_MEMBER`, `ADMIN`) to decide whether to show admin dashboards or project‑workspace controls.

### Roles and view mapping

- **Client/Business users** (`CLIENT_OWNER`, `CLIENT_MEMBER`)

  - Access business overview and project‑delivery views under `frontend/src/pages/business/**` and `frontend/src/components/project/**`.
  - Cannot access admin‑only tooling unless explicitly allowed by role checks.

- **Admin users** (`ADMIN`)
  - Access additional pages under `frontend/src/pages/admin/**` such as admin dashboards and project workspaces.
  - Use components in `frontend/src/components/admin/**` like the sprint board to manage delivery across projects.

The frontend should treat `AuthContext.session.user.role` as the single source of truth when deciding which routes or UI controls are visible for a given user.
