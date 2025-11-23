## Architecture Overview

- **Backend**: Spring Boot REST API (`backend/`, service class `PortalService`) backed by Postgres, with schema migrations managed by Flyway and integration tests using Testcontainers.
- **Frontend**: React + TypeScript + Vite SPA in `frontend/`, styled with Tailwind CSS and structured around pages, services, typed domain models, and shared layout components.
- **Auth**: Keycloak realm (`keycloak/realm-export/client-portal-realm.json`) issuing JWTs; Spring Security validates tokens and the frontend uses an `AuthContext` and `ProtectedRoute` for gated areas.
- **Orchestration**: `docker-compose.yml` runs Postgres, Keycloak, the API container, and the frontend dev container wired together for local development.

### High-Level System

- **Browser** → React SPA (`frontend/src/main.tsx`) → **API** (`/api/**` controllers) → **Postgres DB** (via Spring Data + Flyway-managed schema).
- **Authentication**:
  - Browser is redirected to Keycloak; user authenticates and receives an access token.
  - Frontend stores the session in `AuthContext` and attaches the Bearer token to API calls via `httpClient`.
  - Backend validates JWTs with `SecurityConfig` and `KeycloakRealmRoleConverter`, enforcing authentication for all endpoints except healthcheck and ping.

### Main Domains

- **Business onboarding**: Businesses and their primary contacts; creation of projects for a business (`BusinessController`, `PortalService.createProject`).
- **Project delivery lifecycle**: Projects move through stages (`ProjectStage`), with approval state (`ProjectApprovalState`), epics, stories, sprints, and meetings representing the work.
- **Experiences**:
  - **Client/Business users**: Navigate under `/business/**` to see their projects, delivery roadmap, backlog, and schedule.
  - **Admin users**: Navigate under `/admin/**` to manage projects, epics, backlog, and sprint lifecycle.

### Key Backend Components

- **Controllers** (`backend/src/main/java/com/gergen/portal/api`):
  - `BusinessController`: `/api/businesses/{businessId}/overview`, `/projects` list and create.
  - `ProjectController`: `/api/projects/**` for meetings, stage, epics, stories, sprints, and status notes.
- **Service Layer**:
  - `PortalService` (`com.gergen.portal.service`): central orchestration for project delivery operations; works against `PortalDataStore` as the abstraction over persistence.
- **DTOs** (`api/dto`, `api/dto/request`): Request/response shapes for projects, epics, stories, sprints, meetings, and businesses.
- **Domain Enums** (`domain`): `ProjectStage`, `ProjectApprovalState`, `EpicStatus`, `StoryStage`, `SprintStatus`, etc., define allowed states.
- **Security** (`config/SecurityConfig`): Configures stateless JWT resource server, CORS (from `app.cors.allowed-origins`), and accepted issuers for Keycloak.

### Key Frontend Pieces

- **Routing** (`frontend/src/main.tsx`):
  - Public pages: `/`, `/faq`, `/signup`, `/login`.
  - Authenticated business area: `/business/**` under `BusinessWorkspaceLayout`.
  - Authenticated admin area: `/admin/**` under `AdminWorkspaceLayout`.
- **Contexts** (`frontend/src/context`):
  - `AuthContext`: manages the logged-in user session and token.
  - `ServiceContext`: wires up typed service singletons for components.
- **Services** (`frontend/src/services`):
  - `ProjectService`, `BusinessService`, `AuthService`, shared `httpClient`, and index wiring.
- **Domain Types** (`frontend/src/types/domain.ts`): Canonical TypeScript types that mirror backend DTOs and enums.
- **Layout & Workspace** (`frontend/src/components/layout`):
  - `SiteLayout`: wraps public and workspace routes with global chrome.
  - `WorkspaceChrome`: shared layout for business and admin workspaces.
- **Project Delivery UI** (`frontend/src/components/project`, `frontend/src/pages/**/project`):
  - Roadmap, sprints, meetings, stage header, stage-specific admin/client views, backlog boards, and sprint boards.

# Architecture Overview

## High-Level System

- **Backend**: Spring Boot 3 application (`backend/`, module `client-portal-api`) exposing a JSON REST API, backed by PostgreSQL and managed schema migrations via Flyway.
- **Frontend**: React + TypeScript + Vite SPA in `frontend/` using Tailwind CSS for styling.
- **Auth**: Keycloak realm in `keycloak/realm-export/client-portal-realm.json`, used as an OpenID Connect provider and JWT issuer for the API and SPA.
- **Orchestration**: `docker-compose.yml` starts Postgres, Keycloak, the API (`api` service), and the frontend dev server (`web` service).

### Runtime Data Flow

1. **Browser → Frontend**: User loads the React SPA from the `web` container (Vite dev server) or a built static bundle.
2. **Auth via Keycloak**: SPA uses Keycloak (realm `client-portal`) for login; the user obtains an access token.
3. **Frontend → Backend**: Frontend services call the API on the `api` container (default `http://localhost:8080`) using `fetch`/`httpClient`, attaching the bearer token.
4. **Backend → DB**: Spring Boot reads/writes project-delivery data in PostgreSQL via JPA repositories and Flyway-managed schema.
5. **Response → Frontend**: API returns DTOs; the frontend maps them to TypeScript types under `frontend/src/types/domain.ts` and updates React state.

### Main Domains & Experiences

- **Business onboarding**: Businesses and their projects are created and listed via `BusinessController` and `PortalService`.
- **Project delivery lifecycle**: Projects move through stages (requirements → planning → execution → maintaining) with epics, stories, sprints, and meetings managed by `PortalService` and related DTOs.
- **Roles & experiences**:
  - **Business/client users**: Navigate under `/business/**` routes to see their projects, delivery roadmap, backlog, schedule, and ops.
  - **Admins**: Navigate under `/admin/**` routes to manage projects, backlog, sprint planning/active views, and delivery boards.

## Backend Structure

Root package: `com.gergen.portal` under `backend/src/main/java`.

- `api/`
  - REST controllers such as `BusinessController` and `ProjectController` expose project-delivery endpoints under `/api/businesses` and `/api/projects`.
- `api/dto/`
  - Response DTOs: `BusinessDto`, `BusinessOverviewDto`, `ProjectSummaryDto`, `ProjectDetailDto`, `EpicDto`, `StoryDto`, `SprintDto`, `MeetingDto`, `DefectDetailsDto`.
  - `api/dto/request/`: Request DTOs for create/update operations (e.g., `CreateProjectRequest`, `CreateEpicRequest`, `UpdateStoryStageRequest`, `EndSprintRequest`).
- `domain/`
  - Domain enums representing state machines: `ProjectStage`, `ProjectApprovalState`, `EpicStatus`, `StoryStage`, `SprintStatus`, `MeetingType`, `PortalUserRole` (and a partially wired `EpicType` referenced by `EpicDto`).
- `service/`
  - `PortalService`: Central orchestration layer that implements business logic for projects, epics, stories, sprints, meetings, and project status notes using a `PortalDataStore` abstraction.
- `model/`, `repo/`
  - JPA entities and repositories that back the long-term persistence layer.
- `security/`
  - Spring Security configuration wiring JWT resource-server behavior and Keycloak integration.

`PortalService` currently uses `PortalDataStore` to load and persist aggregates (`ProjectDetailDto`, `BusinessDto` etc.), acting as a façade over the underlying persistence implementation.

## Frontend Structure

Root: `frontend/`.

- `src/main.tsx`
  - Bootstraps React (`StrictMode`), wraps the app in `HelmetProvider`, `ServiceProvider`, and `AuthProvider`, and wires React Router routes.
  - Defines routes for public pages (`/`, `/faq`, `/signup`, `/login`) and protected sections under `/business/**` and `/admin/**` using `ProtectedRoute`.
- `src/pages/`
  - Public pages: `Home.tsx`, `FAQ.tsx`, `Signup.tsx`, `Login.tsx`.
  - Business workspace: `business/BusinessWorkspaceLayout.tsx`, `BusinessDashboard.tsx`, and `business/project/*` (project overview, schedule, backlog, delivery, ops).
  - Admin workspace: `admin/AdminWorkspaceLayout.tsx`, `AdminDashboard.tsx`, and `admin/project/*` (overview, schedule, epics, delivery, ops, sprint views).
- `src/components/`
  - `layout/`: global layouts such as `SiteLayout` and `WorkspaceChrome` used to wrap major route segments.
  - `project/`: project-delivery visualizations (roadmap, sprints, meetings, stage header, stage controls, etc.).
  - `admin/`: admin-specific components like sprint boards.
  - `ui/`: shared UI primitives (buttons, cards, modals, etc.) styled with Tailwind.
- `src/context/`
  - `AuthContext.tsx`: manages authentication state and token handling.
  - `ServiceContext.tsx`: provides access to service instances (e.g., `ProjectService`, `BusinessService`, `AuthService`).
- `src/services/`
  - `ProjectService.ts`, `BusinessService.ts`, `AuthService.ts`, `httpClient.ts`, and `index.ts` integrate the frontend with the backend API.
- `src/types/domain.ts`
  - TypeScript representations of projects, epics, stories, sprints, meetings, and associated enums; serves as the canonical frontend model of the API.

## Docker & Environments

- `docker-compose.yml` defines services:
  - `postgres`: PostgreSQL 16 with a `client_portal` DB.
  - `keycloak`: Keycloak 25, importing the client-portal realm.
  - `api`: builds from `backend/`, configured with DB and Keycloak env vars.
  - `web`: builds from `frontend/`, runs `npm run dev` for local development.
- Environment variables (`VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`, `VITE_API_BASE_URL`, `VITE_PORTAL_BUSINESS_ID`) are injected into the frontend at build/runtime via Vite.

This document is intended as a fast orientation for both humans and agents; see the other docs in `Docs/` for deeper dives into the domain model, backend design, API contracts, auth, and frontend behavior.
