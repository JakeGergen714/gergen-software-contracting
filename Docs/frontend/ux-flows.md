## UX Flows

### Personas

- **Client / Business User**

  - Works inside the business workspace under `/business/**`.
  - Focused on understanding project status, upcoming work, and key meetings.

- **Admin User**
  - Works inside the admin workspace under `/admin/**`.
  - Focused on managing epics, backlog, sprint lifecycle, and overall delivery.

### Client / Business User Flows

#### 1. Log In and Land in Workspace

- Entry points:
  - Public home page: `frontend/src/pages/Home.tsx` at `/`.
  - Login page: `frontend/src/pages/Login.tsx` at `/login`.
- Flow:
  - User clicks "Log in" and is redirected through Keycloak via `AuthService` / `KeycloakAuthService`.
  - On success, `AuthContext` stores a `UserSession` and `ProtectedRoute` grants access to `/business/**`.

#### 2. View Business Dashboard and Project List

- Route: `/business/projects`.
- Layout: `BusinessWorkspaceLayout` (`frontend/src/pages/business/BusinessWorkspaceLayout.tsx`) wrapped in `SiteLayout` and `WorkspaceChrome`.
- Screen: `BusinessDashboard` (`frontend/src/pages/business/BusinessDashboard.tsx`).
- Data:
  - Uses `BusinessService.getOverview` / `listProjects` to load projects for the configured business ID.
- Main actions:
  - Select a project to open its workspace at `/business/projects/:projectId`.

#### 3. Navigate Project Delivery Workspace

- Base route: `/business/projects/:projectId` → `BusinessProjectLayout` (`frontend/src/pages/business/project/BusinessProjectLayout.tsx`).
- Child routes and views:
  - `overview` → `BusinessProjectOverview.tsx`: high-level project summary, stage header, key stats.
  - `schedule` → `BusinessProjectSchedule.tsx`: meetings tied to project stages.
  - `backlog` → `BusinessProjectBacklog.tsx`: story backlog grouped by stage/epic.
  - `delivery` → `BusinessProjectDelivery.tsx`: roadmap, sprints, and execution-focused view.
  - `ops` → `BusinessProjectOps.tsx`: operational details and status note.
- Components:
  - Project delivery components in `frontend/src/components/project/*` (roadmap, sprints, meetings, stage header, stage controls).
- Data flow:
  - Pages call `ProjectService.getProject` to fetch a `ProjectDetail` and then pass slices to components.

### Admin User Flows

#### 1. Log In as Admin

- Same login flow as business users via `/login` and Keycloak.
- User with `ADMIN` role will see admin navigation under `/admin/**` once authenticated.

#### 2. Admin Dashboard and Project Selection

- Route: `/admin`.
- Layout: `AdminWorkspaceLayout` (`frontend/src/pages/admin/AdminWorkspaceLayout.tsx`).
- Screen: `AdminDashboard` (`frontend/src/pages/admin/AdminDashboard.tsx`).
- Main actions:
  - List and select projects to manage at `/admin/projects/:projectId`.

#### 3. Admin Project Workspace

- Base route: `/admin/projects/:projectId` → `AdminProjectLayout` (`frontend/src/pages/admin/project/AdminProjectLayout.tsx`).
- Key child routes:
  - `overview` → `AdminProjectOverview.tsx`: project detail with admin-focused controls.
  - `schedule` → `AdminProjectSchedule.tsx`: manage meetings (e.g., discovery, review, standups).
  - `delivery` → `AdminProjectDelivery.tsx`: overall delivery roadmap and status.
  - `epics` → `AdminProjectEpics.tsx`: create/update epics, manage status and color.
  - `ops` → `AdminProjectOps.tsx`: operational settings and status note.

#### 4. Sprint Lifecycle Management

- Nested sprint route: `/admin/projects/:projectId/sprint` → `AdminProjectSprintLayout.tsx`.
- Child routes:
  - `backlog` → `AdminProjectBacklog.tsx`: manage stories, planning order, and assignments.
  - `planning` → `AdminSprintPlanning.tsx`: assign stories to sprints, prepare upcoming iteration.
  - `active` → `AdminSprintActive.tsx`: active sprint view, often visualized via `SprintBoard`.
- Components:
  - `SprintBoard` (`frontend/src/components/admin/SprintBoard.tsx`) for board-style sprint visualization.
  - Stage-specific views in `frontend/src/components/project/stages/*` (e.g., `PlanningAdminView`, `ExecutionAdminView`).
- Data flow:
  - Uses `ProjectService` methods for create/start/end sprints and moving stories between stages.

## Frontend UX Flows

### Personas

- **Client user (business owner/member)**

  - Represents the customer using the portal to see onboarding progress and project delivery status.
  - Typically has role `CLIENT_OWNER` or `CLIENT_MEMBER` in `UserSession.user.role`.

- **Admin (internal delivery team)**
  - Represents internal staff managing onboarding and project execution.
  - Has role `ADMIN` and can access admin‑only workspaces and controls.

### Client user flows

#### 1. Login / signup

- Starts at `Home` or `Login` page (`frontend/src/pages/Home.tsx`, `frontend/src/pages/Login.tsx`, `frontend/src/pages/Signup.tsx`).
- Uses `AuthContext` (`frontend/src/context/AuthContext.tsx`) which delegates to `KeycloakAuthService` for the OIDC login/signup flows.
- Upon successful auth, `AuthContext` stores a `UserSession` containing user + business info.

#### 2. Business overview

- Main business workspace pages live under `frontend/src/pages/business/**`.
- Typical navigation:
  - Router directs authenticated client users to `BusinessWorkspaceLayout` then `BusinessDashboard`.
  - `BusinessDashboard` loads the current business and its projects via `BusinessService` (`frontend/src/services/BusinessService.ts`).
  - The page is wrapped in `WorkspaceChrome` for a consistent workspace shell.

#### 3. Project delivery view

- Client selects a project from the dashboard, navigating to `BusinessProjectLayout` under `frontend/src/pages/business/project/BusinessProjectLayout.tsx`.
- Child routes provide focused tabs:
  - `BusinessProjectOverview` — high‑level project summary.
  - `BusinessProjectSchedule` — upcoming meetings and milestones.
  - `BusinessProjectBacklog` — backlog and epics in a read‑or‑light‑edit view.
  - `BusinessProjectDelivery` — active delivery state (sprints, progress, status note).
  - `BusinessProjectOps` — operational details for ongoing work.
- Each tab uses components from `frontend/src/components/project/**` (roadmap, sprints, meetings, stage header) to render the `ProjectDetail` aggregate.

### Admin flows

#### 1. Admin dashboard

- Admin routes live under `frontend/src/pages/admin/**`.
- After login, admins are routed to `AdminWorkspaceLayout` then `AdminDashboard`.
- Dashboard surfaces projects and businesses that may need attention, using `BusinessService` and `ProjectService`.

#### 2. Admin project workspace and sprint views

- Admin navigates to an individual project via `AdminProjectLayout` (`frontend/src/pages/admin/project/AdminProjectLayout.tsx`).
- Within that layout, tab‑like routes include:
  - `AdminProjectOverview` — overall status and key metrics.
  - `AdminProjectSchedule` — planning and review meetings.
  - `AdminProjectDelivery` — execution‑focused delivery view.
  - `AdminProjectEpics` — epic management and planning.
  - `AdminProjectOps` — operations and configuration.
- Sprint‑focused routes live under `AdminProjectSprintLayout` with children:
  - `AdminProjectBacklog` — backlog grooming and story intake.
  - `AdminSprintPlanning` — assigning stories to sprints and setting goals.
  - `AdminSprintActive` — active sprint board, progress tracking.

#### 3. Managing epics, stories, sprints, and meetings

- Admins use controls wired to `ProjectService` to:
  - Create/update/delete epics.
  - Create/update/delete stories and move them between stages.
  - Create/start/end/delete sprints.
  - Schedule and adjust meetings at different project stages.
- All operations call the project‑delivery API and re‑render the updated `ProjectDetail` aggregate in the respective views.
