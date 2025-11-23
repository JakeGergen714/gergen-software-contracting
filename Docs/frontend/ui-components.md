## UI Components

### Layout Components

- **SiteLayout**

  - File: `frontend/src/components/layout/SiteLayout.tsx`.
  - Responsibilities:
    - Provides top-level app chrome (header with navigation, footer).
    - Renders navigation links for Home, FAQ, and workspace links for Business/Admin when a session exists.
    - Wraps routed content in `PageShell` and includes an `Outlet` for nested routes.

- **WorkspaceChrome**
  - File: `frontend/src/components/layout/WorkspaceChrome.tsx`.
  - Responsibilities:
    - Shared layout shell for business and admin workspaces, including side navigation and workspace-specific header.
    - Applied inside `BusinessWorkspaceLayout` and `AdminWorkspaceLayout` to give a consistent project workspace feel.

### Project Delivery Components

- **ProjectStageHeader**

  - File: `frontend/src/components/project/ProjectStageHeader.tsx`.
  - Shows the current `ProjectStage`, approval state, and key status badges.
  - Often used together with `StageControls` and stage-specific views.

- **StageControls**

  - File: `frontend/src/components/project/StageControls.tsx`.
  - Provides controls to advance the project stage and update status notes.
  - Talks to `ProjectService.advanceStage` and `ProjectService.updateStatusNote`.

- **ProjectRoadmap**

  - File: `frontend/src/components/project/ProjectRoadmap.tsx`.
  - Renders epics in a "roadmap" list, showing name, description, color, and acceptance criteria.
  - Integrates with `DomainModalProvider` to open epic detail modals.

- **ProjectSprints**

  - File: `frontend/src/components/project/ProjectSprints.tsx`.
  - Shows sprint timeline/cards using sprint status, dates, and goals.
  - Provides hooks for actions like starting/ending a sprint (via `ProjectService`).

- **ProjectMeetings**

  - File: `frontend/src/components/project/ProjectMeetings.tsx`.
  - Displays scheduled meetings grouped by `ProjectStage` and `MeetingType`.
  - Used in both business and admin schedule views.

- **Stage-Specific Views**

  - Directory: `frontend/src/components/project/stages/`.
  - Includes components like:
    - `RequirementsClientView.tsx` / `RequirementsAdminView.tsx`.
    - `PlanningClientView.tsx` / `PlanningAdminView.tsx`.
    - `ExecutionClientView.tsx` / `ExecutionAdminView.tsx`.
  - Each view provides tailored UI and copy for the current project stage and persona.

- **Admin Sprint Board**
  - File: `frontend/src/components/admin/SprintBoard.tsx`.
  - Board-style view of stories in the active sprint, typically organized by `StoryStage` columns.

### Reusable UI Components

- **Card**

  - File: `frontend/src/components/ui/Card.tsx`.
  - Props: `padding` (`sm` | `md` | `lg` | `none`), `variant` (`surface` | `panel` | `glass`).
  - Applies composite CSS utility classes (`surface-card`, `surface-panel`, `glass`) to render consistent cards/panels.

- **PageShell**

  - File: `frontend/src/components/ui/PageShell.tsx`.
  - Wraps page content in the `page-shell` and `grid-shell` classes for consistent spacing and max-width.

- **PageHeader**

  - File: `frontend/src/components/ui/PageHeader.tsx`.
  - Standardizes page titles, descriptions, and optional actions.

- **StatTile**

  - File: `frontend/src/components/ui/StatTile.tsx`.
  - Uses the `stat-tile` utility class for KPI-like tiles on dashboards.

- **Modal**

  - File: `frontend/src/components/ui/Modal.tsx`.
  - Generic modal dialog wrapper for displaying forms or detail views (e.g., story/epic details).

- **FormSection**
  - File: `frontend/src/components/ui/FormSection.tsx`.
  - Groups form fields with consistent spacing and labels, used across admin/business forms.

### Common Patterns

- Components heavily leverage Tailwind utility classes and custom utility classes defined in `frontend/src/index.css` (e.g., `surface-card`, `surface-panel`, `btn-primary`, `btn-secondary`).
- Status and stage information is usually encoded via badge-like elements, using color tokens from `tailwind.config.js` (brand/electric/emerald/amber) and CSS variables.
- Layout components favor responsive `grid-shell` containers and `PageShell` to keep content centered and readable across screen sizes.

## Frontend UI Components

### Layout components

- `SiteLayout` — `frontend/src/components/layout/SiteLayout.tsx`

  - Global app shell with header, nav, and footer.
  - Uses `PageShell` to provide consistent page padding and max‑width.
  - Shows top‑nav links (Home, FAQ, Business, Admin) and login/logout controls based on `AuthContext`.

- `WorkspaceChrome` — `frontend/src/components/layout/WorkspaceChrome.tsx`
  - Authenticated workspace shell for business/admin areas.
  - Accepts `navItems` (label, path, icon) and renders them as a rail or bar, depending on layout props.
  - Shows workspace header with business name, user name, role, search, notifications, and sign‑out button.
  - Wraps inner content in a responsive grid with optional left navigation rail.

### Project delivery components

Located under `frontend/src/components/project/**`.

- `ProjectStageHeader`

  - Renders the project title, current `ProjectStage`, approval state, and key status note.
  - Often used at the top of project overview/delivery screens.

- `StageControls`

  - Provides controls to advance `ProjectStage` and update the project status note.
  - Talks to `ProjectService` to call the appropriate backend endpoints.

- `ProjectRoadmap`

  - Visualizes project epics and stages along a horizontal roadmap.
  - Uses domain enums like `ProjectStage` and `EpicStatus` along with stage metadata from `stageMeta.ts`.

- `ProjectSprints`

  - Shows a list or grid of sprints (`Sprint` objects) with names, goals, dates, and `SprintStatus`.
  - Includes actions to create, start, end, and delete sprints, wired to sprint endpoints.

- `ProjectMeetings`

  - Visualizes meetings (`Meeting` entities) across project stages.
  - Uses `MeetingType` and `ProjectStage` to group sessions and highlight upcoming calls.

- Stage‑specific views under `components/project/stages/**`
  - `RequirementsClientView`, `RequirementsAdminView`, `PlanningClientView`, `PlanningAdminView`, `ExecutionClientView`, `ExecutionAdminView`.
  - Provide tailored content and controls per stage and persona, built on top of the shared components above.

### Admin‑only components

- `SprintBoard` — `frontend/src/components/admin/SprintBoard.tsx`
  - Kanban‑style board showing stories grouped by `StoryStage` and sprint.
  - Used primarily inside admin sprint views to drag/drop or otherwise move stories between stages and sprints.
  - Interacts with `ProjectService` to update story stage and sprint assignments.

### Common UI components

Located under `frontend/src/components/ui/**`.

- `PageShell`

  - Basic container component that applies page padding, background, and max‑width.

- `PageHeader`

  - Standardized header for pages (title, subtitle, optional actions).

- `Card`

  - Panel component for grouping related content with a subtle shadow/border.

- `FormSection`

  - Structured layout for forms with labeled sections and descriptions.

- `Modal`

  - Generic dialog component for confirmations, editors, or detail views.

- `StatTile`
  - Compact KPI/stat tile for dashboards (e.g., counts of active projects or sprints).

New UI pieces should, where possible, reuse these primitives and follow the same layout and naming conventions.
