## Screens

### Public Screens

- **Home**

  - File: `frontend/src/pages/Home.tsx`.
  - Route: `/`.
  - Purpose: marketing/landing page introducing the portal and linking to signup/login.
  - Key components: `SiteLayout`, hero/CTA sections.

- **Login**

  - File: `frontend/src/pages/Login.tsx`.
  - Route: `/login`.
  - Purpose: entry point into Keycloak-powered auth; may show minimal form or immediately redirect to IdP.

- **Signup**

  - File: `frontend/src/pages/Signup.tsx`.
  - Route: `/signup`.
  - Purpose: onboarding a new user/business; delegates to `AuthService.signup`.

- **FAQ**
  - File: `frontend/src/pages/FAQ.tsx`.
  - Route: `/faq`.
  - Purpose: static FAQ about how the portal works.

### Business Workspace Screens

- **Business Dashboard**

  - File: `frontend/src/pages/business/BusinessDashboard.tsx`.
  - Route: `/business/projects` (default child of `/business`).
  - Purpose: list of projects for the current business, with at-a-glance stage and approval state.
  - Data: `BusinessService.getOverview` / `listProjects`.

- **Business Project Layout**

  - File: `frontend/src/pages/business/project/BusinessProjectLayout.tsx`.
  - Route base: `/business/projects/:projectId`.
  - Purpose: common chrome and tabs for project-specific views (overview, schedule, backlog, delivery, ops).

- **Business Project Overview**

  - File: `BusinessProjectOverview.tsx`.
  - Route: `/business/projects/:projectId/overview`.
  - Purpose: show key project details, current stage, approval state, and high-level summary components like `ProjectStageHeader`.

- **Business Project Schedule**

  - File: `BusinessProjectSchedule.tsx`.
  - Route: `/business/projects/:projectId/schedule`.
  - Purpose: list and manage meetings for the project by stage.
  - Components: `ProjectMeetings`.

- **Business Project Backlog**

  - File: `BusinessProjectBacklog.tsx`.
  - Route: `/business/projects/:projectId/backlog`.
  - Purpose: view stories grouped by epic and stage; basic backlog management for client users.

- **Business Project Delivery**

  - File: `BusinessProjectDelivery.tsx`.
  - Route: `/business/projects/:projectId/delivery`.
  - Purpose: provide a delivery-focused view including roadmap, sprints, and meetings.
  - Components: `ProjectRoadmap`, `ProjectSprints`, `ProjectMeetings`, `ProjectStageHeader`.

- **Business Project Ops**
  - File: `BusinessProjectOps.tsx`.
  - Route: `/business/projects/:projectId/ops`.
  - Purpose: operational details such as editing the project status note and logistics.

### Admin Workspace Screens

- **Admin Dashboard**

  - File: `frontend/src/pages/admin/AdminDashboard.tsx`.
  - Route: `/admin`.
  - Purpose: at-a-glance view of active projects and key delivery metrics for admins.

- **Admin Project Layout**

  - File: `frontend/src/pages/admin/project/AdminProjectLayout.tsx`.
  - Route base: `/admin/projects/:projectId`.
  - Purpose: wrapper for all admin project tabs (overview, schedule, delivery, epics, ops, sprint workspace).

- **Admin Project Overview**

  - File: `AdminProjectOverview.tsx`.
  - Route: `/admin/projects/:projectId/overview`.
  - Purpose: project summary plus admin-only controls for stage advancement and status updates.

- **Admin Project Schedule**

  - File: `AdminProjectSchedule.tsx`.
  - Route: `/admin/projects/:projectId/schedule`.
  - Purpose: schedule and manage meetings such as discovery, review, and standups.

- **Admin Project Delivery**

  - File: `AdminProjectDelivery.tsx`.
  - Route: `/admin/projects/:projectId/delivery`.
  - Purpose: admin view of roadmap, sprints, and work in progress, often combining `ProjectRoadmap`, `ProjectSprints`, and admin-specific stage views.

- **Admin Project Epics**

  - File: `AdminProjectEpics.tsx`.
  - Route: `/admin/projects/:projectId/epics`.
  - Purpose: create/update epics, change epic status and color, and manage client-facing summaries.

- **Admin Project Ops**
  - File: `AdminProjectOps.tsx`.
  - Route: `/admin/projects/:projectId/ops`.
  - Purpose: admin operational controls and status notes.

### Admin Sprint Workspace Screens

- **Admin Project Sprint Layout**

  - File: `AdminProjectSprintLayout.tsx`.
  - Route base: `/admin/projects/:projectId/sprint`.
  - Purpose: container layout for sprint backlog/planning/active views.

- **Admin Backlog**

  - File: `AdminProjectBacklog.tsx`.
  - Route: `/admin/projects/:projectId/sprint/backlog`.
  - Purpose: detailed backlog management (story creation, assignment, planning order) from an admin perspective.

- **Admin Sprint Planning**

  - File: `AdminSprintPlanning.tsx`.
  - Route: `/admin/projects/:projectId/sprint/planning`.
  - Purpose: plan the next sprint by assigning stories, adjusting points and priorities.

- **Admin Sprint Active**
  - File: `AdminSprintActive.tsx`.
  - Route: `/admin/projects/:projectId/sprint/active`.
  - Purpose: active sprint execution view, often using `SprintBoard` for board-style tracking.

## Frontend Screens

### Public and auth screens

- **Home** — `frontend/src/pages/Home.tsx`

  - Landing page with high‑level overview content and entry points to login/signup.

- **Login** — `frontend/src/pages/Login.tsx`

  - Initiates the login flow via `AuthContext.login`, which delegates to `KeycloakAuthService`.
  - Redirects back into the app with a populated `UserSession` after OIDC completes.

- **Signup** — `frontend/src/pages/Signup.tsx`

  - Kicks off signup/onboarding through `AuthContext.signup`.
  - Collects basic user + business info before handing off to Keycloak/registration.

- **FAQ** — `frontend/src/pages/FAQ.tsx`
  - Static FAQ content explaining how the portal works for clients.

### Business (client) workspace

- **Business workspace layout** — `frontend/src/pages/business/BusinessWorkspaceLayout.tsx`

  - Provides navigation and chrome for all business‑focused pages.
  - Wraps content in `WorkspaceChrome` with navigation items for business routes.

- **Business dashboard** — `frontend/src/pages/business/BusinessDashboard.tsx`

  - Entry point for authenticated client users.
  - Shows an overview of the current business and its projects using data from `BusinessService`.

- **Business project layout** — `frontend/src/pages/business/project/BusinessProjectLayout.tsx`
  - Hosts tabbed views for a single project.
  - Child screens:
    - `BusinessProjectOverview` — project snapshot and key metrics.
    - `BusinessProjectSchedule` — overview of scheduled meetings.
    - `BusinessProjectBacklog` — backlog/epic view.
    - `BusinessProjectDelivery` — sprint and delivery progress.
    - `BusinessProjectOps` — operational details.

### Admin screens

- **Admin workspace layout** — `frontend/src/pages/admin/AdminWorkspaceLayout.tsx`

  - Wraps admin pages in `WorkspaceChrome`.
  - Adds admin‑specific navigation and chrome.

- **Admin dashboard** — `frontend/src/pages/admin/AdminDashboard.tsx`

  - Portfolio view for internal staff.
  - May list businesses/projects requiring attention, filtered by status or stage.

- **Admin project layout** — `frontend/src/pages/admin/project/AdminProjectLayout.tsx`

  - Root for a given project’s admin workspace.
  - Child screens:
    - `AdminProjectOverview` — admin‑focused project snapshot.
    - `AdminProjectSchedule` — planning and review meetings.
    - `AdminProjectDelivery` — execution/delivery view.
    - `AdminProjectEpics` — epic management.
    - `AdminProjectOps` — operational settings.

- **Admin sprint layout** — `frontend/src/pages/admin/project/AdminProjectSprintLayout.tsx`
  - Nested layout under `/admin/projects/:projectId/sprint`.
  - Child screens:
    - `AdminProjectBacklog` — backlog grooming.
    - `AdminSprintPlanning` — sprint planning tools.
    - `AdminSprintActive` — active sprint board/progress.

### Layout components used by screens

- `SiteLayout` — `frontend/src/components/layout/SiteLayout.tsx`

  - Global shell for the app (header, footer, global nav).

- `WorkspaceChrome` — `frontend/src/components/layout/WorkspaceChrome.tsx`
  - Inner shell for authenticated workspaces (sidebars, page titles, breadcrumbs).

These layouts are composed around pages via the router configuration in `frontend/src/main.tsx`.
