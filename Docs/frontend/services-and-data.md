## Services and Data

### Domain Types

- File: `frontend/src/types/domain.ts`.
- Purpose:
  - Canonical TypeScript representation of backend DTOs.
  - Includes enums-as-string-unions (`ProjectStage`, `ProjectApprovalState`, `EpicStatus`, `StoryStage`, `SprintStatus`) and core entities (`Business`, `ProjectSummary`, `ProjectDetail`, `Epic`, `Story`, `Sprint`, `Meeting`).
  - Also defines input shapes for creating/updating stories, epics, sprints, meetings, and projects.

### HTTP Client

- File: `frontend/src/services/httpClient.ts`.
- Responsibilities:
  - Wraps the underlying HTTP library (e.g., `fetch`/`axios`) with typed helpers: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete<T>`.
  - Configures base URL from `appConfig.apiBaseUrl`.
  - Injects a bearer token into the `Authorization` header using a callback passed at construction time.

### AuthService

- File: `frontend/src/services/AuthService.ts`.
- Interface: `AuthService`.
- Implementation: `KeycloakAuthService`.
- Responsibilities:
  - Integrates with Keycloak for login, signup, logout, and session retrieval.
  - Exposes methods used by `AuthContext`:
    - `getSession(): Promise<UserSession | null>`.
    - `login(input?: LoginInput)` and `signup(input?: SignupInput)`.
    - `logout()`.
  - Provides `getAccessToken()` used by `HttpClient` to attach JWTs to API requests.

### BusinessService

- File: `frontend/src/services/BusinessService.ts`.
- Interface: `BusinessService`.
- Implementation: `ApiBusinessService` (uses `HttpClient`).
- Methods:
  - `getOverview(businessId: string): Promise<BusinessOverview>` → `GET /api/businesses/{businessId}/overview`.
  - `listProjects(businessId: string): Promise<ProjectSummary[]>` → `GET /api/businesses/{businessId}/projects`.
  - `createProject(businessId: string, input: CreateProjectInput): Promise<ProjectDetail>` → `POST /api/businesses/{businessId}/projects`.

### ProjectService

- File: `frontend/src/services/ProjectService.ts`.
- Interface: `ProjectService`.
- Implementation: `ApiProjectService`.
- Key methods and corresponding endpoints:
  - `getProject(projectId)` → `GET /api/projects/{projectId}`.
  - Meetings:
    - `addMeeting(projectId, input)` → `POST /api/projects/{projectId}/meetings`.
  - Project stage & status:
    - `advanceStage(projectId, stage)` → `PUT /api/projects/{projectId}/stage`.
    - `updateStatusNote(projectId, statusNote)` → `PATCH /api/projects/{projectId}/status-note`.
  - Epics:
    - `createEpic(projectId, input)` → `POST /api/projects/{projectId}/epics`.
    - `updateEpic(projectId, epicId, input)` → `PATCH /api/projects/{projectId}/epics/{epicId}`.
    - `updateEpicStatus(projectId, epicId, status)` → `POST /api/projects/{projectId}/epics/{epicId}/status`.
    - `deleteEpic(projectId, epicId)` → `DELETE /api/projects/{projectId}/epics/{epicId}`.
  - Stories:
    - `createStory(projectId, input)` → `POST /api/projects/{projectId}/stories`.
    - `updateStory(projectId, storyId, input)` → `PATCH /api/projects/{projectId}/stories/{storyId}`.
    - `updateStoryStage(projectId, storyId, stage)` → `POST /api/projects/{projectId}/stories/{storyId}/stage`.
    - `deleteStory(projectId, storyId)` → `DELETE /api/projects/{projectId}/stories/{storyId}`.
  - Sprints:
    - `createSprint(projectId, input)` → `POST /api/projects/{projectId}/sprints`.
    - `startSprint(projectId, sprintId)` → `POST /api/projects/{projectId}/sprints/{sprintId}/start`.
    - `endSprint(projectId, sprintId, options)` → `POST /api/projects/{projectId}/sprints/{sprintId}/end`.
    - `deleteSprint(projectId, sprintId)` → `DELETE /api/projects/{projectId}/sprints/{sprintId}`.

### Service Registry and Context

- File: `frontend/src/services/index.ts`.
- Exports a `services: ServiceRegistry` object with:
  - `auth: AuthService`.
  - `business: BusinessService`.
  - `project: ProjectService`.
- Uses a single `HttpClient` instance wired to `appConfig.apiBaseUrl` and the `auth.getAccessToken()` callback.

- File: `frontend/src/context/ServiceContext.tsx`.
  - Provides a React context (`ServiceProvider`, `useServices`) that exposes the shared `services` registry to components.

### Data Flow Pattern

Typical request/response flow for project delivery features:

1. **Component**: A page or component (e.g., `BusinessProjectDelivery`, `AdminSprintPlanning`) calls a method from `useServices()` (e.g., `project.getProject`, `project.createStory`).
2. **Service**: The service (`ProjectService`, `BusinessService`) builds the correct HTTP request with typed input objects.
3. **HTTP Client**: `HttpClient` attaches the bearer token from `AuthService.getAccessToken()` and sends the request to the backend API.
4. **Backend**: Spring controllers and `PortalService` handle the request, operate on domain objects, and return DTOs.
5. **Typed Response**: The frontend receives JSON, typed as `ProjectDetail`, `ProjectSummary`, etc., thanks to generics in `HttpClient`.
6. **State/UI**: Components update state (e.g., React state, context, or local component state) and re-render using domain types from `domain.ts`.

### Notes

- The in-memory `mockDataStore.ts` under `frontend/src/services` is legacy and should no longer be used; all data should come from the real backend API via `HttpClient`.
- When evolving the backend DTOs, keep `frontend/src/types/domain.ts` and service method signatures in sync to preserve end-to-end type safety.

## Frontend Services and Data Flow

### Domain types

- `frontend/src/types/domain.ts` defines the canonical TypeScript types used across the UI and services.
  - Enums as string unions: `ProjectStage`, `ProjectApprovalState`, `EpicStatus`, `StoryStage`, `SprintStatus` (matching backend enums and JSON values).
  - Entities: `Business`, `ProjectSummary`, `ProjectDetail`, `Epic`, `Story`, `Sprint`, `Meeting`.
  - Auth and session: `User`, `UserSession`, `LoginInput`, `SignupInput`.
  - Input shapes mirroring backend DTOs: `CreateProjectInput`, `CreateEpicInput`, `CreateStoryInput`, `UpdateStoryInput`, `CreateSprintInput`, `EndSprintOptions`, `ScheduleMeetingInput`.
- These types are treated as the single source of truth for frontend code; components and services should import from this file rather than redefining shapes.

### HTTP client

- `HttpClient` (`frontend/src/services/httpClient.ts`)
  - Wraps `fetch` or a similar API to send JSON requests to the backend.
  - Injected with `appConfig.apiBaseUrl` and a function `() => auth.getAccessToken()` so all calls automatically include the current bearer token.
  - Provides convenience methods: `get`, `post`, `put`, `patch`, `delete`.

### Service composition

- `services/index.ts`

  - Constructs concrete service instances:
    - `auth: KeycloakAuthService`.
    - `business: ApiBusinessService`.
    - `project: ApiProjectService`.
  - Exports a `ServiceRegistry` with these instances and a default `services` object.

- `ServiceContext` (`frontend/src/context/ServiceContext.tsx`)
  - React context providing the `ServiceRegistry` to components.
  - `ServiceProvider` wraps the app in `main.tsx` and uses the default `services` instance.
  - `useServices` hook gives easy access to `auth`, `business`, and `project` services.

### Auth service

- `AuthService` / `KeycloakAuthService` (`frontend/src/services/AuthService.ts`)

  - Encapsulates Keycloak JS client setup and login/logout flows.
  - Implements:
    - `signup` and `login` → redirect to Keycloak.
    - `logout` → log out of Keycloak and clear local session.
    - `getSession` →
      - ensures Keycloak is initialized (optionally using silent SSO).
      - if authenticated, loads the current business via `/api/businesses/{businessId}/overview`.
      - maps the Keycloak token into a `User` and returns `UserSession` `{ token, user, business }`.
    - `getAccessToken` → returns a fresh token, refreshing when close to expiry.
  - Uses environment‑driven config from `appConfig` (`frontend/src/config.ts`) for API base URL, Keycloak URL/realm/client, and the business ID.

- `AuthContext` (`frontend/src/context/AuthContext.tsx`)
  - Wraps `AuthService` in React state:
    - Loads initial `session` on mount via `auth.getSession()`.
    - Exposes `login`, `signup`, `logout` methods that call the corresponding service operations, then refresh the session.
  - `ProtectedRoute` and layout components read from this context.

### Business and project services

- `BusinessService` / `ApiBusinessService` (`frontend/src/services/BusinessService.ts`)

  - Methods:
    - `getOverview(businessId)` → `GET /api/businesses/{businessId}/overview` returning `BusinessOverview`.
    - `listProjects(businessId)` → `GET /api/businesses/{businessId}/projects` returning `ProjectSummary[]`.
    - `createProject(businessId, input)` → `POST /api/businesses/{businessId}/projects` returning `ProjectDetail`.

- `ProjectService` / `ApiProjectService` (`frontend/src/services/ProjectService.ts`)
  - Wraps all core project‑delivery endpoints:
    - `getProject(projectId)` → load `ProjectDetail` aggregate.
    - `addMeeting(projectId, ScheduleMeetingInput)`.
    - `advanceStage(projectId, ProjectStage)`.
    - `createEpic`, `updateEpic`, `updateEpicStatus`, `deleteEpic`.
    - `createStory`, `updateStory`, `updateStoryStage`, `deleteStory`.
    - `createSprint`, `startSprint`, `endSprint`, `deleteSprint`.
    - `updateStatusNote`.
  - Each method returns the updated `ProjectDetail`, allowing callers to replace local state with the server’s source of truth.

### Typical data flow

1. **User interaction in a component**

   - Example: User clicks "Add story" in a backlog view (`BusinessProjectBacklog`, `AdminProjectBacklog`).

2. **Component calls a service**

   - Component uses `useServices()` to get `project` and calls `project.createStory(projectId, input)` with a `CreateStoryInput` built from form values.

3. **Service issues HTTP request**

   - `ApiProjectService` delegates to `HttpClient.post` with the appropriate URL and body.
   - `HttpClient` attaches the bearer token via `auth.getAccessToken()` and sends JSON to the backend.

4. **Backend applies business rules**

   - Spring controller forwards the request DTO to `PortalService`.
   - `PortalService` updates the `ProjectDetailDto` aggregate (epics, stories, sprints, meetings) and persists via `PortalDataStore`.

5. **Typed response back to the UI**

   - The API responds with a `ProjectDetailDto` JSON.
   - `HttpClient` parses JSON into a `ProjectDetail` typed object (using the `domain.ts` types).

6. **State update and re‑render**
   - The component receives the new `ProjectDetail` and updates React state or context.
   - Child components like `ProjectRoadmap`, `ProjectSprints`, `ProjectMeetings`, and stage‑specific views re‑render based on the latest data.

This pattern (component → service → API → DTO → typed response → state) is used consistently for business overview, project delivery, and admin workflows.
