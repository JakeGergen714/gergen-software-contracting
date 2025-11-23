## API Contracts

This document summarizes the main project-delivery endpoints, their HTTP methods and paths, and the primary request/response DTOs. All responses use JSON with enums serialized as uppercase strings (mirrored by `frontend/src/types/domain.ts`).

### Projects

- **Get business project list**

  - `GET /api/businesses/{businessId}/projects`
  - Response: `ProjectSummaryDto[]`
  - Key fields: `id`, `businessId`, `name`, `description`, `stage`, `approvalState`, `kickoffCallAt`, `updatedAt`, optional `statusNote`.

- **Get business overview**

  - `GET /api/businesses/{businessId}/overview`
  - Response: `BusinessOverviewDto` (`business`, `projects[]`).

- **Create project**

  - `POST /api/businesses/{businessId}/projects`
  - Request: `CreateProjectRequest`
    - Fields: `name`, `description`, `kickoffCallAt`.
  - Response: `ProjectDetailDto`
    - Includes project summary plus nested `epics[]`, `stories[]`, `sprints[]`, `meetings[]`.

- **Get project detail**

  - `GET /api/projects/{projectId}`
  - Response: `ProjectDetailDto`.

- **Advance project stage**

  - `PUT /api/projects/{projectId}/stage`
  - Request: `AdvanceProjectStageRequest`
    - Fields: `stage: ProjectStage` (e.g., `REQUIREMENTS`, `PLANNING`, `EXECUTION`, `MAINTAINING`).
  - Response: updated `ProjectDetailDto`.

- **Update project status note**
  - `PATCH /api/projects/{projectId}/status-note`
  - Request: `UpdateStatusNoteRequest`
    - Fields: `statusNote: string`.
  - Response: updated `ProjectDetailDto`.

### Epics

- **Create epic**

  - `POST /api/projects/{projectId}/epics`
  - Request: `CreateEpicRequest`
    - Fields: `name`, `description`, `color`, `acceptanceCriteria: string[]`, optional `clientSummary`.
  - Response: `ProjectDetailDto` with new epic appended to `epics[]` (default `status = PLANNED`).

- **Update epic**

  - `PATCH /api/projects/{projectId}/epics/{epicId}`
  - Request: `UpdateEpicRequest`
    - Optional fields: `name`, `description`, `color`, `acceptanceCriteria[]`, `clientSummary`.
  - Response: updated `ProjectDetailDto`.

- **Update epic status**

  - `POST /api/projects/{projectId}/epics/{epicId}/status`
  - Request: `UpdateEpicStatusRequest`
    - Fields: `status: EpicStatus` (e.g., `PLANNED`, `AWAITING_APPROVAL`, `APPROVED`, `IN_PROGRESS`, `DONE`).
  - Response: updated `ProjectDetailDto`.

- **Delete epic**
  - `DELETE /api/projects/{projectId}/epics/{epicId}`
  - Behavior: removes epic and any `StoryDto` with matching `epicId`.
  - Response: updated `ProjectDetailDto`.

### Stories

- **Create story**

  - `POST /api/projects/{projectId}/stories`
  - Request: `CreateStoryRequest`
    - Fields:
      - `epicId: UUID` (must reference an epic on the same project).
      - `title: string`.
      - Optional: `description?: string`, `acceptanceCriteria: string[]`, `points?: number`, `sprintId?: UUID | null`, `stage?: StoryStage`, `planningOrder?: number | null`.
  - Behavior:
    - If `stage` is omitted, defaults to `BACKLOG`.
  - Response: updated `ProjectDetailDto`.

- **Update story**

  - `PATCH /api/projects/{projectId}/stories/{storyId}`
  - Request: `UpdateStoryRequest`
    - Fields: same shape as `CreateStoryRequest`, but intended as full update.
  - Behavior:
    - Validates that `epicId` belongs to the project.
  - Response: updated `ProjectDetailDto`.

- **Update story stage**

  - `POST /api/projects/{projectId}/stories/{storyId}/stage`
  - Request: `UpdateStoryStageRequest`
    - Fields: `stage: StoryStage` (`BACKLOG`, `READY`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
  - Response: updated `ProjectDetailDto`.

- **Delete story**
  - `DELETE /api/projects/{projectId}/stories/{storyId}`
  - Response: updated `ProjectDetailDto`.

### Sprints

- **Create sprint**

  - `POST /api/projects/{projectId}/sprints`
  - Request: `CreateSprintRequest`
    - Fields: `name`, `goal`, `startAt`, `endAt`.
  - Response: updated `ProjectDetailDto` (new sprint added with `status = PLANNED`).

- **Start sprint**

  - `POST /api/projects/{projectId}/sprints/{sprintId}/start`
  - Behavior:
    - Marks the given sprint `ACTIVE` and sets `startAt` if missing.
    - Auto-completes any other `ACTIVE` sprint to `COMPLETE` and sets `endAt` if missing.
  - Response: updated `ProjectDetailDto`.

- **End sprint**

  - `POST /api/projects/{projectId}/sprints/{sprintId}/end`
  - Request: optional `EndSprintRequest`
    - Fields: `moveUnfinishedToNextSprint: boolean` (defaults to `false` when body is absent).
  - Behavior:
    - Marks sprint `COMPLETE`, sets `endAt` if missing.
    - Moves unfinished stories:
      - If `moveUnfinishedToNextSprint = true` and a next sprint exists (by `startAt`), moves unfinished stories to that sprint and bumps `BACKLOG` stories to `READY`.
      - Otherwise, removes `sprintId` and sets stage back to `BACKLOG`.
  - Response: updated `ProjectDetailDto`.

- **Delete sprint**
  - `DELETE /api/projects/{projectId}/sprints/{sprintId}`
  - Behavior: removes the sprint and clears `sprintId` on any stories that referenced it.
  - Response: updated `ProjectDetailDto`.

### Meetings

- **Schedule meeting**
  - `POST /api/projects/{projectId}/meetings`
  - Request: `ScheduleMeetingRequest`
    - Fields: `stage: ProjectStage`, `scheduledAt: Instant`, `type: MeetingType`, `locationUrl`, `summary`, optional `notes`.
  - Response: updated `ProjectDetailDto`.

### Enum Representation

- All enums are serialized as strings in JSON.
- Frontend domain types (`frontend/src/types/domain.ts`) mirror these values as string unions:
  - `ProjectStage`, `ProjectApprovalState`, `EpicStatus`, `StoryStage`, `SprintStatus`, `Meeting.type`, and user `role`.

## API Contracts

This document summarizes the core project‑delivery REST API exposed by the backend. All endpoints are JSON over HTTP.

### Conventions

- **Base paths:**
  - Business operations under `/api/businesses`.
  - Project operations under `/api/projects`.
- **IDs:** UUID strings in path and payloads.
- **Enums:** serialized as uppercase strings (e.g. `"REQUIREMENTS"`, `"IN_PROGRESS"`).

### Business endpoints

- `GET /api/businesses/{businessId}/overview`

  - **Response:** `BusinessOverviewDto` → `{ business: BusinessDto, projects: ProjectSummaryDto[] }`.
  - Use to load the business home/overview view.

- `GET /api/businesses/{businessId}/projects`

  - **Response:** `ProjectSummaryDto[]` — list of projects for the business.

- `POST /api/businesses/{businessId}/projects`
  - **Request:** `CreateProjectRequest`
    - Fields: `name`, `description`, `kickoffCallAt` (ISO-8601 timestamp).
  - **Response:** `ProjectDetailDto` — full project aggregate including epics, stories, sprints, meetings.

### Project endpoints

- `GET /api/projects/{projectId}`
  - **Response:** `ProjectDetailDto` with:
    - `ProjectSummaryDto` fields (`id`, `businessId`, `name`, `description`, `stage`, `approvalState`, `kickoffCallAt`, `updatedAt`, `statusNote`).
    - Collections: `epics: EpicDto[]`, `stories: StoryDto[]`, `sprints: SprintDto[]`, `meetings: MeetingDto[]`.

#### Meetings

- `POST /api/projects/{projectId}/meetings`
  - **Request:** `ScheduleMeetingRequest`
    - `stage: ProjectStage` — which project stage this meeting belongs to.
    - `scheduledAt: Instant` — when the meeting occurs.
    - `type: MeetingType` — e.g. `DISCOVERY`, `REVIEW`, `STANDUP`.
    - `locationUrl: string` — video/conference link.
    - `summary: string`, `notes?: string`.
  - **Response:** updated `ProjectDetailDto`.

#### Project stage and status note

- `PUT /api/projects/{projectId}/stage`

  - **Request:** `AdvanceProjectStageRequest`
    - `stage: ProjectStage` (`REQUIREMENTS`, `PLANNING`, `EXECUTION`, `MAINTAINING`).
  - **Response:** updated `ProjectDetailDto`.

- `PATCH /api/projects/{projectId}/status-note`
  - **Request:** `UpdateStatusNoteRequest`
    - `statusNote: string` — brief free‑text update for stakeholders.
  - **Response:** updated `ProjectDetailDto`.

#### Epics

- `POST /api/projects/{projectId}/epics`

  - **Request:** `CreateEpicRequest`
    - `name: string`, `description: string`, `color: string`.
    - `acceptanceCriteria: string[]` — bullet‑point acceptance criteria.
    - `clientSummary?: string` — high‑level summary in client‑friendly terms.
  - **Response:** updated `ProjectDetailDto` with new `EpicDto` appended.

- `PATCH /api/projects/{projectId}/epics/{epicId}`

  - **Request:** `UpdateEpicRequest` (all fields optional)
    - Updatable fields: `name`, `description`, `color`, `acceptanceCriteria`, `clientSummary`.
  - **Response:** updated `ProjectDetailDto`.

- `POST /api/projects/{projectId}/epics/{epicId}/status`

  - **Request:** `UpdateEpicStatusRequest`
    - `status: EpicStatus` — `PLANNED`, `AWAITING_APPROVAL`, `APPROVED`, `IN_PROGRESS`, `DONE`.
  - **Response:** updated `ProjectDetailDto`.

- `DELETE /api/projects/{projectId}/epics/{epicId}`
  - **Response:** updated `ProjectDetailDto` with the epic removed and any attached stories deleted.

#### Stories

- `POST /api/projects/{projectId}/stories`

  - **Request:** `CreateStoryRequest`
    - `epicId: UUID` — must reference an epic on this project.
    - `title: string`, `description?: string`.
    - `acceptanceCriteria: string[]`.
    - `points?: number` — story points.
    - `sprintId?: UUID | null` — optional sprint association.
    - `stage?: StoryStage` — defaults to `BACKLOG` when omitted.
    - `planningOrder?: number | null` — ordering within planning views.
  - **Response:** updated `ProjectDetailDto`.

- `PATCH /api/projects/{projectId}/stories/{storyId}`

  - **Request:** `UpdateStoryRequest`
    - Similar to `CreateStoryRequest` but all fields controlled by the UI when editing an existing story.
  - **Response:** updated `ProjectDetailDto`.

- `POST /api/projects/{projectId}/stories/{storyId}/stage`

  - **Request:** `UpdateStoryStageRequest`
    - `stage: StoryStage` (`BACKLOG`, `READY`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
  - **Response:** updated `ProjectDetailDto`.

- `DELETE /api/projects/{projectId}/stories/{storyId}`
  - **Response:** updated `ProjectDetailDto` with the story removed.

#### Sprints

- `POST /api/projects/{projectId}/sprints`

  - **Request:** `CreateSprintRequest`
    - `name: string`, `goal: string`.
    - `startAt: Instant`, `endAt: Instant` — planned sprint window.
  - **Response:** updated `ProjectDetailDto` with a new `SprintDto` (status `PLANNED`).

- `POST /api/projects/{projectId}/sprints/{sprintId}/start`

  - **Request:** none (path parameters only).
  - **Response:** updated `ProjectDetailDto`.
  - Side effects:
    - Marks selected sprint `ACTIVE` and sets `startAt` when missing.
    - Any other `ACTIVE` sprint is set to `COMPLETE` with `endAt` populated.

- `POST /api/projects/{projectId}/sprints/{sprintId}/end`

  - **Request:** optional `EndSprintRequest`
    - `moveUnfinishedToNextSprint: boolean` (default false when body omitted).
  - **Response:** updated `ProjectDetailDto`.
  - Side effects:
    - Marks sprint `COMPLETE`, sets `endAt` if null.
    - For each story attached to the sprint and not `DONE`:
      - If `moveUnfinishedToNextSprint` and there is a chronologically next sprint, moves the story’s `sprintId` there and upgrades `stage` from `BACKLOG` → `READY`.
      - Otherwise, clears the story’s `sprintId` and sets `stage` back to `BACKLOG`.

- `DELETE /api/projects/{projectId}/sprints/{sprintId}`
  - **Response:** updated `ProjectDetailDto`; stories previously pointing at this sprint will have `sprintId` nulled.

### Enum JSON representation

Domain enums used in these endpoints (`ProjectStage`, `ProjectApprovalState`, `EpicStatus`, `StoryStage`, `SprintStatus`, and `MeetingType`) are serialized as simple uppercase strings in JSON. The frontend type definitions in `frontend/src/types/domain.ts` mirror these values one‑to‑one.
