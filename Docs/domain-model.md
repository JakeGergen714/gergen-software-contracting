## Domain Model

### Core Entities

- **Business**

  - Represents a client organization.
  - Fields (via DTOs): `id`, `name`, `primaryContactUserId`, `createdAt`.
  - Relationships: has many `Project` records.

- **Project**

  - Represents a delivery engagement for a `Business`.
  - Fields: `id`, `businessId`, `name`, `description`, `kickoffCallAt`, `stage`, `approvalState`, `statusNote`, `updatedAt`.
  - Relationships: has many `Epic`, `Story`, `Sprint`, and `Meeting` records.

- **Epic**

  - High-level feature or initiative within a project.
  - Fields: `id`, `projectId`, `name`, `description`, `color`, `status`, `acceptanceCriteria[]`, optional `clientSummary`.
  - Relationships: parent for many `Story` records.

- **Story**

  - Individual backlog item linked to an `Epic`.
  - Fields: `id`, `projectId`, `epicId`, `title`, optional `description`, `acceptanceCriteria[]`, `stage`, optional `sprintId`, optional `points`, optional `planningOrder`.
  - Relationships: belongs to a `Project`, belongs to an `Epic`, optionally assigned to a `Sprint`.

- **Sprint**

  - Time-boxed iteration for a project.
  - Fields: `id`, `projectId`, `name`, `goal`, `startAt`, `endAt`, `status`, optional `notes`.
  - Relationships: a project has many sprints; stories can point to a sprint via `sprintId`.

- **Meeting**
  - Scheduled touchpoint tied to a project stage.
  - Fields: `id`, `projectId`, `stage`, `scheduledAt`, `type`, `locationUrl`, `summary`, optional `notes`.
  - Relationships: belongs to a `Project`.

### Relationships & Cardinalities

- `Business` 1 — \* N `Project`.
- `Project` 1 — \* N `Epic`.
- `Project` 1 — \* N `Story`.
- `Epic` 1 — \* N `Story`.
- `Project` 1 — \* N `Sprint`.
- `Project` 1 — \* N `Meeting`.
- `Sprint` 1 — \* N `Story` (via `Story.sprintId`, optional).

### Domain Enums & State Machines

- **ProjectStage** (`backend/domain/ProjectStage.java`, `frontend/src/types/domain.ts`)

  - Values: `REQUIREMENTS`, `PLANNING`, `EXECUTION`, `MAINTAINING`.
  - Semantics:
    - `REQUIREMENTS`: discovery and scoping; meetings often of type DISCOVERY.
    - `PLANNING`: backlog shaping, epic/story refinement, initial sprint planning.
    - `EXECUTION`: active development and sprinting.
    - `MAINTAINING`: post-launch maintenance and follow-up work.

- **ProjectApprovalState** (`backend/domain/ProjectApprovalState.java`)

  - Values: `DRAFT`, `AWAITING_CLIENT`, `CLIENT_APPROVED`, `CHANGES_REQUESTED`.
  - Typical flow: `DRAFT` → `AWAITING_CLIENT` → (`CLIENT_APPROVED` or `CHANGES_REQUESTED`).

- **EpicStatus** (`backend/domain/EpicStatus.java`)

  - Values: `PLANNED`, `AWAITING_APPROVAL`, `APPROVED`, `IN_PROGRESS`, `DONE`.
  - New epics start as `PLANNED` (`PortalService.createEpic`) and are advanced via the update-status endpoint.

- **EpicType**

  - Enum is partially wired (e.g., `FEATURE`, `DEFECT`) for distinguishing feature epics from defect work.
  - `DefectDetailsDto` exists to hold additional context for defect-type epics, but wiring is incomplete and currently causes build issues when referenced from `EpicDto`.

- **StoryStage** (`backend/domain/StoryStage.java`)

  - Values: `BACKLOG`, `READY`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`.
  - Created stories default to `BACKLOG` if stage is not provided (`PortalService.createStory`).
  - Stage can be updated explicitly (`updateStory`, `updateStoryStage`) or implicitly when sprints end.

- **SprintStatus** (`backend/domain/SprintStatus.java`)

  - Values: `PLANNED`, `ACTIVE`, `COMPLETE`.
  - New sprints start as `PLANNED`.
  - `startSprint` marks the chosen sprint `ACTIVE` and auto-completes any other `ACTIVE` sprint to `COMPLETE` (enforcing at most one active sprint per project).
  - `endSprint` marks the sprint `COMPLETE` and moves unfinished stories based on options.

- **MeetingType** (`backend/domain/MeetingType.java`)
  - Values correspond to frontend `Meeting.type` union: `DISCOVERY`, `REVIEW`, `STANDUP`.

### Core Business Rules

- **One active sprint per project**

  - `PortalService.startSprint` sets the requested sprint to `ACTIVE` and automatically sets any other `ACTIVE` sprint to `COMPLETE`.

- **Stories linked to epics**

  - `PortalService.createStory` and `updateStory` call `ensureEpicExists` to guarantee the referenced `epicId` belongs to the same project.

- **Sprint completion and story movement**

  - `PortalService.endSprint` supports `moveUnfinishedToNextSprint`:
    - If `true` and there is a next sprint (by chronological `startAt`), unfinished stories move to that sprint and `BACKLOG` stories become `READY`.
    - Otherwise, unfinished stories are de-scoped: `sprintId` cleared, stage reset to `BACKLOG`.

- **Project stage and meetings**

  - Meetings (`MeetingDto`) are tied to a `ProjectStage` to give context (e.g., discovery calls vs execution reviews).
  - `advanceProjectStage` directly sets `Project.stage` based on the request payload.

- **Status note per project**

  - Each project has a freeform `statusNote` updated via `updateStatusNote` to give a human summary of current state.

- **Enum JSON representation**
  - Enums are serialized as uppercase strings, and the frontend domain types mirror those string values for tight alignment between API and UI.

# Domain Model

## Core Entities

- **Business** (`BusinessDto`, `Business` entity)

  - Represents a client organization.
  - Key fields: `id`, `name`, `primaryContactUserId`, `createdAt`.
  - One business can own multiple projects.

- **Project** (`ProjectSummaryDto`, `ProjectDetailDto`)

  - Delivery engagement for a business.
  - Fields include: `id`, `businessId`, `name`, `description`, `stage`, `approvalState`, `kickoffCallAt`, `statusNote`, `updatedAt`.
  - `ProjectDetailDto` aggregates all delivery artifacts: `epics`, `stories`, `sprints`, and `meetings`.

- **Epic** (`EpicDto`)

  - Large unit of work within a project.
  - Fields: `id`, `projectId`, `name`, `description`, `color`, `status`, `type`, `acceptanceCriteria`, `clientSummary`, optional `defectDetails`.
  - Each epic belongs to exactly one project.

- **Story** (`StoryDto`)

  - Smaller unit of work linked to an epic and optionally a sprint.
  - Fields: `id`, `projectId`, `epicId`, `title`, `description`, `acceptanceCriteria`, `stage`, optional `sprintId`, `points`, `planningOrder`.
  - Each story belongs to one project and one epic; may optionally be placed in a sprint.

- **Sprint** (`SprintDto`)

  - Timeboxed iteration of work for a project.
  - Fields: `id`, `projectId`, `name`, `goal`, `startAt`, `endAt`, `status`, optional `notes`.
  - A project can have many sprints, but only one sprint should be `ACTIVE` at a time.

- **Meeting** (`MeetingDto`)
  - Represents scheduled calls/meetings tied to a project.
  - Fields: `id`, `projectId`, `stage`, `scheduledAt`, `type`, `locationUrl`, `summary`, optional `notes`.

## Relationships & Cardinality

- **Business → Project**: 1:N

  - A business can have many projects; each project references a single `businessId`.

- **Project → Epic**: 1:N

  - Each epic references a `projectId`.

- **Project → Story**: 1:N

  - Each story references the parent `projectId`.

- **Epic → Story**: 1:N

  - Each story references an `epicId`.

- **Project → Sprint**: 1:N

  - Each sprint is associated with a single `projectId`.

- **Project → Meeting**: 1:N

  - Each meeting is associated with a `projectId` and a `ProjectStage`.

- **Sprint → Story**: 1:N (optional)
  - Stories optionally reference `sprintId`; stories without `sprintId` are not assigned to a sprint.

## Domain Enums & State Machines

Defined under `backend/src/main/java/com/gergen/portal/domain` and mirrored on the frontend in `frontend/src/types/domain.ts`.

- **`ProjectStage`**

  - Values: `REQUIREMENTS`, `PLANNING`, `EXECUTION`, `MAINTAINING`.
  - Represents the overall lifecycle phase of a project.
  - Projects are typically created in `REQUIREMENTS` and progress forward.

- **`ProjectApprovalState`**

  - Values: `DRAFT`, `AWAITING_CLIENT`, `CLIENT_APPROVED`, `CHANGES_REQUESTED`.
  - Reflects the approval workflow between the delivery team and the client.

- **`EpicStatus`**

  - Values: `PLANNED`, `AWAITING_APPROVAL`, `APPROVED`, `IN_PROGRESS`, `DONE`.
  - Describes the lifecycle of an epic.

- **`EpicType`** (partially wired)

  - Intended values: `FEATURE`, `DEFECT`.
  - Referenced by `EpicDto` but the enum definition currently lives under `com.gergen.portal.domain` and is the source of a compiler error when not available.

- **`StoryStage`**

  - Values: `BACKLOG`, `READY`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`.
  - Represents the kanban state of a story.

- **`SprintStatus`**

  - Values: `PLANNED`, `ACTIVE`, `COMPLETE`.

- **`MeetingType`**

  - Values: `DISCOVERY`, `REVIEW`, `STANDUP`.

- **`PortalUserRole`**
  - Values correspond to roles like `CLIENT_OWNER`, `CLIENT_MEMBER`, `ADMIN` used across backend and frontend.

## Core Business Rules

Derived from `PortalService` and DTO usage:

- **One active sprint per project**

  - When `startSprint` is called on a sprint:
    - That sprint is set to `ACTIVE`.
    - Any other sprint currently `ACTIVE` is transitioned to `COMPLETE` and its `endAt` is set if missing.

- **Ending a sprint and moving stories**

  - `endSprint` transitions a sprint to `COMPLETE` and may move unfinished stories:
    - If `moveUnfinishedToNextSprint = true` and there is a subsequent sprint (sorted by `startAt`), unfinished stories in the ending sprint are re-assigned to the next sprint and moved out of `BACKLOG` to `READY` when appropriate.
    - Otherwise, unfinished stories are unassigned from any sprint (`sprintId = null`) and reset to `BACKLOG`.

- **Stories must reference an epic**

  - `createStory` and `updateStory` call `ensureEpicExists` to verify the referenced `epicId` is present on the project; otherwise a `400 Bad Request` is thrown.

- **Deleting an epic cascades to stories**

  - `deleteEpic` removes the epic and also removes any stories whose `epicId` matched that epic.

- **Sprint deletion does not delete stories**

  - `deleteSprint` removes the sprint but only clears `sprintId` from stories that referenced it.

- **Project status notes**

  - `updateStatusNote` on a project stores a free-form status string (`statusNote`) shown in project overviews.

- **Meetings tied to stages**
  - Meetings include `stage: ProjectStage`, making it easy to display meetings by project phase on the frontend.

This document captures the conceptual domain and key rules; consult `PortalService` and the DTO classes for field-level details when implementing new behavior.
