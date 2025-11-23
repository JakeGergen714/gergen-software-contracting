## Backend Design

### Package Layout

- `com.gergen.portal.api`
  - REST controllers such as `BusinessController` and `ProjectController` that expose `/api/**` endpoints.
- `com.gergen.portal.api.dto`
  - Response DTOs: `BusinessDto`, `BusinessOverviewDto`, `ProjectSummaryDto`, `ProjectDetailDto`, `EpicDto`, `StoryDto`, `SprintDto`, `MeetingDto`, `DefectDetailsDto`, etc.
- `com.gergen.portal.api.dto.request`
  - Request DTOs: `CreateProjectRequest`, `CreateEpicRequest`, `CreateStoryRequest`, `CreateSprintRequest`, `EndSprintRequest`, `ScheduleMeetingRequest`, `AdvanceProjectStageRequest`, `UpdateEpicRequest`, `UpdateEpicStatusRequest`, `UpdateStoryRequest`, `UpdateStoryStageRequest`, `UpdateStatusNoteRequest`.
- `com.gergen.portal.service`
  - `PortalService`: orchestration layer for business and project delivery operations.
  - `PortalDataStore`: abstraction for persistence (in-memory or repository-backed implementation).
- `com.gergen.portal.domain`
  - Domain enums such as `ProjectStage`, `ProjectApprovalState`, `EpicStatus`, `StoryStage`, `SprintStatus`, `MeetingType`, `PortalUserRole`, and a partially wired `EpicType`.
- `com.gergen.portal.model`
  - Entity and persistence models (backed by JPA/Flyway-managed schema).
- `com.gergen.portal.repo`
  - Spring Data repositories for DB access.
- `com.gergen.portal.config`
  - Application and security configuration (`SecurityConfig`, CORS, JWT decoder).
- `com.gergen.portal.security`
  - Helpers for Keycloak integration such as `KeycloakRealmRoleConverter`.

### PortalService as Orchestration Layer

- **Responsibilities**

  - Implements the project delivery workflow for:
    - Business project creation and listing.
    - Project detail retrieval.
    - Meetings, project stage advancement, and status notes.
    - CRUD and status updates for epics and stories.
    - Sprint lifecycle: create, start, end (with optional story movement), delete.
  - Centralizes business rules (single active sprint, epic existence checks, story movement across sprints, etc.).

- **Data Access via PortalDataStore**
  - `PortalService` depends on `PortalDataStore` which provides operations like `findBusiness`, `listProjects`, `findProject`, and `saveProject`.
  - This allows using an in-memory or seeded store for early development while still aligning closely with DB-backed repositories.
  - The persisted shape closely matches `ProjectDetailDto` and related DTOs, enabling straightforward mapping between entities and API responses.

### REST Endpoints and DTO Mapping

- **BusinessController (`/api/businesses`)**

  - `GET /api/businesses/{businessId}/overview` → `BusinessOverviewDto`.
  - `GET /api/businesses/{businessId}/projects` → `ProjectSummaryDto[]`.
  - `POST /api/businesses/{businessId}/projects` → `ProjectDetailDto` (creates project from `CreateProjectRequest`).

- **ProjectController (`/api/projects`)**
  - `GET /api/projects/{projectId}` → `ProjectDetailDto`.
  - `POST /api/projects/{projectId}/meetings` → `ProjectDetailDto` (schedules a meeting from `ScheduleMeetingRequest`).
  - `PUT /api/projects/{projectId}/stage` → `ProjectDetailDto` (advances stage from `AdvanceProjectStageRequest`).
  - `PATCH /api/projects/{projectId}/status-note` → `ProjectDetailDto` (updates status note from `UpdateStatusNoteRequest`).
  - **Epics**:
    - `POST /api/projects/{projectId}/epics` → `ProjectDetailDto` (`CreateEpicRequest`).
    - `PATCH /api/projects/{projectId}/epics/{epicId}` → `ProjectDetailDto` (`UpdateEpicRequest`).
    - `POST /api/projects/{projectId}/epics/{epicId}/status` → `ProjectDetailDto` (`UpdateEpicStatusRequest`).
    - `DELETE /api/projects/{projectId}/epics/{epicId}` → `ProjectDetailDto`.
  - **Stories**:
    - `POST /api/projects/{projectId}/stories` → `ProjectDetailDto` (`CreateStoryRequest`).
    - `PATCH /api/projects/{projectId}/stories/{storyId}` → `ProjectDetailDto` (`UpdateStoryRequest`).
    - `POST /api/projects/{projectId}/stories/{storyId}/stage` → `ProjectDetailDto` (`UpdateStoryStageRequest`).
    - `DELETE /api/projects/{projectId}/stories/{storyId}` → `ProjectDetailDto`.
  - **Sprints**:
    - `POST /api/projects/{projectId}/sprints` → `ProjectDetailDto` (`CreateSprintRequest`).
    - `POST /api/projects/{projectId}/sprints/{sprintId}/start` → `ProjectDetailDto`.
    - `POST /api/projects/{projectId}/sprints/{sprintId}/end` → `ProjectDetailDto` (optional `EndSprintRequest`).
    - `DELETE /api/projects/{projectId}/sprints/{sprintId}` → `ProjectDetailDto`.

### Validation and Error Handling

- **Bean Validation**

  - Request DTOs under `api.dto.request` are annotated with `jakarta.validation` constraints (e.g., `@NotNull`, `@NotBlank`, `@Size`).
  - Controllers are annotated with `@Validated` and use `@Valid @RequestBody` to trigger validation.

- **Business-Level Errors**
  - `PortalService` throws `ResponseStatusException` with appropriate HTTP status for domain errors:
    - `HttpStatus.NOT_FOUND` when entities (business, project, epic, story, sprint) are missing.
    - `HttpStatus.BAD_REQUEST` when invariants are violated (e.g., epic not on project when creating/updating a story).

### Security and Auth

- **SecurityConfig**
  - Defines a stateless JWT resource server with:
    - CSRF disabled, `SessionCreationPolicy.STATELESS`.
    - `/actuator/health` and `/api/ping` as public, all other requests authenticated.
    - JWT validation using `JwtDecoder` configured with `issuer-uri` and a set of accepted issuers (internal container URL and host-mapped URL).
  - CORS is configured via `app.cors.allowed-origins` and allows common methods and headers.
  - Authorities are derived from Keycloak realm roles using `KeycloakRealmRoleConverter`.

### Notes on EpicType and Defects

- `EpicType` and `DefectDetailsDto` are introduced to model feature vs defect work.
- `EpicDto` is wired to reference `EpicType`, but the enum is not fully available on the classpath yet (leading to current build failures).
- Once wired, feature epics will carry standard fields, while defect epics can add structured root-cause/impact details via `DefectDetailsDto`.

## Backend Design

### Stack and entrypoint

- **Framework:** Spring Boot application `com.gergen.portal.ClientPortalApiApplication`.
- **Persistence:** PostgreSQL with Flyway migrations under `backend/src/main/resources/db/migration`.
- **Testing DB:** Testcontainers PostgreSQL via `BaseIntegrationTest`.

### Package layout

- `com.gergen.portal.api`
  - REST controllers such as `BusinessController` and `ProjectController` that expose the project‑delivery API under `/api/**`.
- `com.gergen.portal.api.dto`
  - Response DTOs used by controllers and `PortalService`, e.g. `ProjectSummaryDto`, `ProjectDetailDto`, `EpicDto`, `StoryDto`, `SprintDto`, `MeetingDto`, `BusinessDto`, `BusinessOverviewDto`.
- `com.gergen.portal.api.dto.request`
  - Request DTOs for mutations, e.g. `CreateProjectRequest`, `CreateEpicRequest`, `UpdateEpicRequest`, `UpdateEpicStatusRequest`, `CreateStoryRequest`, `UpdateStoryRequest`, `UpdateStoryStageRequest`, `CreateSprintRequest`, `EndSprintRequest`, `ScheduleMeetingRequest`, `AdvanceProjectStageRequest`, `UpdateStatusNoteRequest`.
- `com.gergen.portal.service`
  - `PortalService` orchestration logic for the project‑delivery lifecycle.
  - `PortalDataStore` abstraction that hides whether data come from an in‑memory store or a DB‑backed implementation.
- `com.gergen.portal.domain`
  - Domain enums and simple value types such as `ProjectStage`, `ProjectApprovalState`, `EpicStatus`, `StoryStage`, `SprintStatus`, `PortalUserRole`, etc. These model the state machines for projects, epics, stories, and sprints.
- `com.gergen.portal.model`
  - JPA entities like `ProjectMember` that are persisted to Postgres.
- `com.gergen.portal.repo`
  - Spring Data repositories (e.g. `ProjectMemberRepository`).
- `com.gergen.portal.security`
  - Security helpers including `KeycloakRealmRoleConverter` and `AccessService`.
- `com.gergen.portal.config`
  - Spring configuration classes such as `SecurityConfig`, `DevSecurityConfig`, and `OpenApiConfig`.

### PortalService orchestration

`PortalService` (`backend/src/main/java/com/gergen/portal/service/PortalService.java`) is the main coordination layer for business and project delivery operations.

- **Data access:** Depends only on `PortalDataStore` to read and write `BusinessDto`, `ProjectSummaryDto`, and `ProjectDetailDto` aggregates.
- **Aggregate root:** `ProjectDetailDto` is treated as the aggregate containing epics, stories, sprints, and meetings.
- **Error handling:** Uses `ResponseStatusException` with `HttpStatus.NOT_FOUND` / `BAD_REQUEST` for missing or invalid resources.

Key responsibilities:

- **Business overview and projects**

  - `getBusinessOverview(businessId)`: loads `BusinessDto` and project summaries, returns `BusinessOverviewDto`.
  - `listProjects(businessId)`: validates the business exists then delegates to `PortalDataStore.listProjects`.
  - `createProject(businessId, CreateProjectRequest)`: initializes a new project with `ProjectStage.REQUIREMENTS` and `ProjectApprovalState.DRAFT`, then saves via `PortalDataStore.saveProject`.

- **Meetings**

  - `scheduleMeeting(projectId, ScheduleMeetingRequest)`: appends a `MeetingDto` (with stage, type, scheduled time, URL, summary, notes) to the project’s `meetings` collection and persists the project.

- **Project stage and status note**

  - `advanceProjectStage(projectId, AdvanceProjectStageRequest)`: sets the project `stage` to the provided `ProjectStage` enum.
  - `updateStatusNote(projectId, UpdateStatusNoteRequest)`: updates the project‑level status note for stakeholders.

- **Epics**

  - `createEpic(projectId, CreateEpicRequest)`: creates a new `EpicDto` with `EpicStatus.PLANNED` and attributes like `name`, `description`, `color`, `acceptanceCriteria`, `clientSummary` and appends it to `ProjectDetailDto.epics`.
  - `updateEpic(projectId, epicId, UpdateEpicRequest)`: applies partial updates to name, description, color, acceptance criteria, and client summary.
  - `updateEpicStatus(projectId, epicId, UpdateEpicStatusRequest)`: updates the `EpicStatus` to drive the epic state machine.
  - `deleteEpic(projectId, epicId)`: removes the epic from the project and also removes any `StoryDto` with `epicId` matching the deleted epic.

- **Stories**

  - `createStory(projectId, CreateStoryRequest)`: ensures the referenced epic exists, then creates a `StoryDto` with `stage` defaulting to `StoryStage.BACKLOG` when not provided.
  - `updateStory(projectId, storyId, UpdateStoryRequest)`: updates epic linkage, text fields, points, sprint association, stage, and planning order.
  - `updateStoryStage(projectId, storyId, UpdateStoryStageRequest)`: moves a story between `StoryStage` columns.
  - `deleteStory(projectId, storyId)`: removes a story; 404s when not found.

- **Sprints**
  - `createSprint(projectId, CreateSprintRequest)`: creates a `SprintDto` with status `SprintStatus.PLANNED`.
  - `startSprint(projectId, sprintId)`: marks the given sprint `ACTIVE` (setting `startAt` if null) and automatically completes any other `ACTIVE` sprint (setting `endAt` if needed). This enforces at most one active sprint per project.
  - `endSprint(projectId, sprintId, EndSprintRequest)`: completes the sprint and, based on `moveUnfinishedToNextSprint`, either:
    - moves unfinished stories to the next chronological sprint and bumps `StoryStage` from `BACKLOG` to `READY`, or
    - clears `sprintId` and returns such stories to `StoryStage.BACKLOG`.
  - `deleteSprint(projectId, sprintId)`: removes the sprint and detaches it from any stories (setting their `sprintId` to null).

Helper methods like `requireBusiness`, `requireProject`, `findEpic`, `findStory`, and `findSprint` encapsulate existence checks and throw appropriate HTTP errors when resources are missing.

### Controllers and REST endpoints

- `BusinessController` (`.../api/BusinessController.java`)

  - `GET /api/businesses/{businessId}/overview` → `BusinessOverviewDto`.
  - `GET /api/businesses/{businessId}/projects` → list of `ProjectSummaryDto`.
  - `POST /api/businesses/{businessId}/projects` → create new project (`CreateProjectRequest` → `ProjectDetailDto`).

- `ProjectController` (`.../api/ProjectController.java`)
  - `GET /api/projects/{projectId}` → `ProjectDetailDto`.
  - `POST /api/projects/{projectId}/meetings` (201) → schedule meeting (`ScheduleMeetingRequest`).
  - `PUT /api/projects/{projectId}/stage` → advance project stage (`AdvanceProjectStageRequest`).
  - `PATCH /api/projects/{projectId}/status-note` → update status note (`UpdateStatusNoteRequest`).
  - `POST /api/projects/{projectId}/epics` (201) → create epic (`CreateEpicRequest`).
  - `PATCH /api/projects/{projectId}/epics/{epicId}` → update epic details (`UpdateEpicRequest`).
  - `POST /api/projects/{projectId}/epics/{epicId}/status` → update epic status (`UpdateEpicStatusRequest`).
  - `DELETE /api/projects/{projectId}/epics/{epicId}` → delete epic.
  - `POST /api/projects/{projectId}/stories` (201) → create story (`CreateStoryRequest`).
  - `PATCH /api/projects/{projectId}/stories/{storyId}` → update story (`UpdateStoryRequest`).
  - `POST /api/projects/{projectId}/stories/{storyId}/stage` → update story stage (`UpdateStoryStageRequest`).
  - `DELETE /api/projects/{projectId}/stories/{storyId}` → delete story.
  - `POST /api/projects/{projectId}/sprints` (201) → create sprint (`CreateSprintRequest`).
  - `POST /api/projects/{projectId}/sprints/{sprintId}/start` → start sprint.
  - `POST /api/projects/{projectId}/sprints/{sprintId}/end` → end sprint (`EndSprintRequest`, optional body).
  - `DELETE /api/projects/{projectId}/sprints/{sprintId}` → delete sprint.

All controllers are annotated with `@Validated` and use `@Valid` on request bodies where appropriate so Bean Validation annotations on DTOs are enforced.

### Validation and error handling

- **Validation:** Request DTOs in `api.dto.request` use Jakarta Bean Validation annotations (e.g. `@NotNull`, `@NotBlank`) to enforce required fields and invariants.
- **Errors:** Business‑level checks in `PortalService` throw `ResponseStatusException` with meaningful messages (e.g. "Business not found", "Epic not found on project"). These are converted by Spring into structured HTTP error responses.

### Persistence and data store abstraction

- `PortalDataStore` is the seam between the pure project‑delivery logic and actual storage.
  - It exposes methods such as `findBusiness(UUID)`, `findProject(UUID)`, `listProjects(UUID businessId)`, and `saveProject(ProjectDetailDto)`.
  - In production, it is expected to be backed by JPA entities and repositories (e.g. `ProjectMemberRepository` and other project/business tables).
- The existing tests (`ProjectMemberRepositoryIT`) prove that repository wiring, Flyway migrations, and the Postgres container are working together.

Use `PortalService` plus the DTOs/enums as the primary extension point when adding new project‑delivery capabilities; keep persistence concerns inside `PortalDataStore` and the `model`/`repo` packages.
