## Testing and Quality

### Backend Testing

- **Integration Test Base**

  - A shared base test class (e.g., `BaseIntegrationTest`) sets up the Spring context, Testcontainers-managed Postgres, and Flyway migrations.
  - Each concrete IT extends this base to test specific repositories or service flows.

- **Example: ProjectMemberRepositoryIT**

  - Lives under `backend/src/test/java` and verifies repository behavior for project membership and role queries.
  - Ensures that entity mappings, relationships, and query methods work as expected against a real database.

- **Test Infrastructure**

  - **Testcontainers**: Spins up an ephemeral Postgres container for tests so they run against a realistic DB.
  - **Flyway**: Applies schema migrations on startup so tests run against the same schema used in production.

- **Running Backend Tests**

  - From repo root:

    ```powershell
    cd "C:\Users\jakeg\OneDrive\Documents\repos\gergen software contracting"
    mvn -f backend/pom.xml test
    ```

  - Or as part of package:

    ```powershell
    mvn -f backend/pom.xml clean package
    ```

### Frontend Quality

- **TypeScript**

  - All app code is written in TypeScript, with domain models centralized in `frontend/src/types/domain.ts` to match backend DTOs.

- **ESLint**

  - Linting configuration is defined in `frontend/eslint.config.js`.
  - Run (if configured in `package.json`): `npm run lint` from `frontend/`.

- **Build as Typecheck**

  - `npm run build` uses Vite’s build pipeline, which also serves as a comprehensive typecheck.
  - VS Code tasks like `Typecheck frontend` are wired to run `npm -s --prefix frontend run build`.

- **Playwright E2E (if enabled)**
  - Playwright configuration and reports live under `frontend/playwright.config.ts` and `frontend/playwright-report/`.
  - Tests can be run via `npm run test:e2e` (check `frontend/package.json` for the exact script name).

### Recommended Pre-Merge Checklist

- **Backend**

  - [ ] `mvn -f backend/pom.xml clean package` passes without compilation or test failures.
  - [ ] New endpoints or behaviors are covered by unit/integration tests where appropriate.

- **Frontend**

  - [ ] `npm run build` from `frontend/` passes (typecheck and bundle succeed).
  - [ ] Lint passes (`npm run lint`) if available.
  - [ ] Key UX flows manually verified: login, business project view, admin project workspace.

- **Docs & Contracts**
  - [ ] DTOs and `frontend/src/types/domain.ts` remain in sync with backend responses.
  - [ ] Any new enums or fields are reflected in `Docs/api-contracts.md` and `Docs/domain-model.md`.

## Testing and Quality

### Backend testing

- `BaseIntegrationTest` (`backend/src/test/java/com/gergen/portal/BaseIntegrationTest.java`)

  - Configures a `postgres:16-alpine` Testcontainer for integration tests.
  - Overrides Spring properties so the app under test uses the container DB.
  - Ensures Flyway migrations run against the container (`spring.flyway.enabled=true`, `spring.flyway.locations=classpath:db/migration`).

- Example integration test: `ProjectMemberRepositoryIT`

  - Lives in `backend/src/test/java/com/gergen/portal/access/ProjectMemberRepositoryIT.java`.
  - Verifies that `ProjectMemberRepository` correctly persists and reads a `ProjectMember` entity by `projectId` and `userId`.
  - Confirms that JPA mappings, Flyway schema, and repository wiring are working.

- To run all backend tests:

```powershell
mvn -f backend/pom.xml test
```

### Frontend quality

- **TypeScript:**
  - All UI and service code is written in TypeScript.
  - `frontend/tsconfig*.json` define strictness and module resolution.
- **ESLint:**
  - `frontend/eslint.config.js` configures lint rules for the React/Vite stack.
- **Build as typecheck:**

  - `npm run build` in `frontend/` runs the Vite build, which surfaces type errors during compilation.

- **End‑to‑end tests:**
  - Playwright tests live under `frontend/tests/e2e`, with configuration in `frontend/playwright.config.ts`.
  - A sample spec (`auth.spec.ts`) exercises the authentication flow.

### Recommended pre‑merge checklist

- Backend

  - `mvn -f backend/pom.xml clean package` passes.
  - New endpoints are covered by at least a slice or integration test when they touch persistence or non‑trivial business rules.

- Frontend

  - `npm run build` passes in `frontend/` (no TS errors).
  - New components/pages reference shared types from `frontend/src/types/domain.ts`.
  - New service calls are isolated in `frontend/src/services/**` and use the shared `HttpClient`.

- General
  - Ensure new code paths are reflected in the docs under `Docs/` (architecture, domain model, API contracts, or frontend docs as appropriate).
