## Routing and Pages

### Router Setup

- Entry point: `frontend/src/main.tsx`.
- Uses `react-router-dom`'s `BrowserRouter`, `Routes`, and nested `Route` elements.
- Global layout:
  - `SiteLayout` (`frontend/src/components/layout/SiteLayout.tsx`) wraps all routes, providing top-level chrome and an `Outlet`.
  - `ProtectedRoute` (`frontend/src/routes/ProtectedRoute.tsx`) gates authenticated sections.

### Public Routes

- `/` → `Home` (`frontend/src/pages/Home.tsx`).
- `/faq` → `FAQ` (`frontend/src/pages/FAQ.tsx`).
- `/signup` → `Signup` (`frontend/src/pages/Signup.tsx`).
- `/login` → `Login` (`frontend/src/pages/Login.tsx`).
- Catch-all: `*` → redirects to `/`.

### Protected Routes (Requires Auth)

- Wrapper: `<Route element={<ProtectedRoute />}>` in `main.tsx`.
- Two main branches:

#### Business Workspace

- Base route: `/business` → `BusinessWorkspaceLayout` (`frontend/src/pages/business/BusinessWorkspaceLayout.tsx`).
- Child routes:
  - `index` → redirect to `projects`.
  - `projects` → `BusinessDashboard.tsx` (overview of business projects).
  - `projects/:projectId` → `BusinessProjectLayout.tsx` with nested children:
    - `index` → redirect to `overview`.
    - `overview` → `BusinessProjectOverview.tsx`.
    - `schedule` → `BusinessProjectSchedule.tsx`.
    - `backlog` → `BusinessProjectBacklog.tsx`.
    - `delivery` → `BusinessProjectDelivery.tsx`.
    - `ops` → `BusinessProjectOps.tsx`.

#### Admin Workspace

- Base route: `/admin` → `AdminWorkspaceLayout` (`frontend/src/pages/admin/AdminWorkspaceLayout.tsx`).
- Child routes:
  - `index` → `AdminDashboard.tsx`.
  - `projects/:projectId` → `AdminProjectLayout.tsx` with nested children:
    - `index` → redirect to `overview`.
    - `overview` → `AdminProjectOverview.tsx`.
    - `schedule` → `AdminProjectSchedule.tsx`.
    - `delivery` → `AdminProjectDelivery.tsx`.
    - `epics` → `AdminProjectEpics.tsx`.
    - `ops` → `AdminProjectOps.tsx`.
    - `sprint` → `AdminProjectSprintLayout.tsx` with nested children:
      - `index` → redirect to `backlog`.
      - `backlog` → `AdminProjectBacklog.tsx`.
      - `planning` → `AdminSprintPlanning.tsx`.
      - `active` → `AdminSprintActive.tsx`.

### Layout Components

- **SiteLayout**

  - Provides global shell (header/footer, toasts, modals) and wraps both public and workspace pages.

- **WorkspaceChrome** (`frontend/src/components/layout/WorkspaceChrome.tsx`)
  - Used inside business and admin workspace layouts to provide sidebar/navigation and content scaffolding for project workspaces.

### Route Guarding

- `ProtectedRoute` uses `AuthContext` to check for a `UserSession`.
- While loading the session, shows a full-page loading state.
- If no session is found, redirects to `/login` and preserves the intended `location` in state.

## Frontend Routing and Pages

### Router setup

- The main router is defined in `frontend/src/main.tsx` using `react-router-dom`.
- Top‑level structure:
  - `SiteLayout` wraps all routes to provide the global header/footer shell.
  - Public routes:
    - `/` → `Home`
    - `/faq` → `FAQ`
    - `/signup` → `Signup`
    - `/login` → `Login`
  - Authenticated routes are nested inside `ProtectedRoute`, which checks `AuthContext`:
    - `/business/**` — client/business workspace.
    - `/admin/**` — admin workspace.
  - Fallback: `*` → redirect to `/`.

### Business routes

- Base route: `/business` → `BusinessWorkspaceLayout` (wraps content in `WorkspaceChrome`).
- Child routes:
  - Index (`/business`) redirects to `/business/projects`.
  - `/business/projects` → `BusinessDashboard`.
  - `/business/projects/:projectId` → `BusinessProjectLayout`, which hosts nested project tabs:
    - Index redirects to `/business/projects/:projectId/overview`.
    - `/business/projects/:projectId/overview` → `BusinessProjectOverview`.
    - `/business/projects/:projectId/schedule` → `BusinessProjectSchedule`.
    - `/business/projects/:projectId/backlog` → `BusinessProjectBacklog`.
    - `/business/projects/:projectId/delivery` → `BusinessProjectDelivery`.
    - `/business/projects/:projectId/ops` → `BusinessProjectOps`.

### Admin routes

- Base route: `/admin` → `AdminWorkspaceLayout`.
- Child routes:
  - Index (`/admin`) → `AdminDashboard`.
  - `/admin/projects/:projectId` → `AdminProjectLayout` with nested tabs:
    - Index redirects to `/admin/projects/:projectId/overview`.
    - `/admin/projects/:projectId/overview` → `AdminProjectOverview`.
    - `/admin/projects/:projectId/schedule` → `AdminProjectSchedule`.
    - `/admin/projects/:projectId/delivery` → `AdminProjectDelivery`.
    - `/admin/projects/:projectId/epics` → `AdminProjectEpics`.
    - `/admin/projects/:projectId/ops` → `AdminProjectOps`.
    - `/admin/projects/:projectId/sprint` → `AdminProjectSprintLayout` with nested sprint views:
      - Index redirects to `/admin/projects/:projectId/sprint/backlog`.
      - `/admin/projects/:projectId/sprint/backlog` → `AdminProjectBacklog`.
      - `/admin/projects/:projectId/sprint/planning` → `AdminSprintPlanning`.
      - `/admin/projects/:projectId/sprint/active` → `AdminSprintActive`.

### Layout components

- `SiteLayout` (`frontend/src/components/layout/SiteLayout.tsx`)

  - Wraps top‑level public and workspace routes.
  - Provides header navigation between Home, FAQ, Business, Admin, Login, Signup.
  - Uses `PageShell` to center main content and a footer with simple links.

- `BusinessWorkspaceLayout` / `AdminWorkspaceLayout`

  - Wrap business/admin pages in `WorkspaceChrome`.
  - Supply nav items for the left rail and top bar.

- `BusinessProjectLayout` / `AdminProjectLayout` / `AdminProjectSprintLayout`
  - Provide nested layout for project‑specific views.
  - Each uses `Outlet` to render the currently selected tab or sprint view.

### Route protection

- `ProtectedRoute` (`frontend/src/routes/ProtectedRoute.tsx`)
  - Wraps all `/business/**` and `/admin/**` routes.
  - Reads `session` and `loading` from `AuthContext`.
  - While loading, shows a spinner/placeholder; when unauthenticated, redirects to login; otherwise renders an `Outlet` for nested routes.
