# Playwright End‑to‑End Testing

This document explains how Playwright E2E tests are structured and how they cover the admin and client (business) portals.

## Overview

- **Framework**: `@playwright/test` configured via `frontend/playwright.config.ts`.
- **Test location**: `frontend/tests/e2e`.
- **Execution**: `npm run test:e2e` (headless) or `npm run test:e2e:ui` from `frontend/`.
- **Target app**: The React/Vite frontend served at `E2E_PORTAL_URL` (defaults to `http://localhost:5173`).

## Configuration

- File: `frontend/playwright.config.ts`.
- Key settings:
  - `testDir: './tests/e2e'` – all specs live here.
  - `baseURL` comes from `E2E_PORTAL_URL` env var.
  - HTML reports are written under `frontend/playwright-report/`.
  - Traces, videos, and screenshots are retained on failure for debugging.

### Environment

- Default env file: `.env.e2e` in `frontend/` (can be overridden using `E2E_ENV_FILE`).
- Important variables:
  - `E2E_PORTAL_URL` – base URL of the portal under test.
  - Any OIDC/Keycloak settings required for auth flows (see `Docs/auth-and-security.md`).

## Test Suite Structure

All specs import from `@playwright/test` and are grouped with `test.describe`. We follow a **feature‑oriented** convention:

- `auth.spec.ts` – authentication and login flows.
- `admin.spec.ts` – admin workspace and project management flows.
- `client.spec.ts` – client (business) workspace and project flows.

Each spec file focuses on a set of related routes and user journeys, making it easy for other agents or contributors to extend coverage.

## Admin Portal Coverage (`admin.spec.ts`)

- **Admin dashboard** (`/admin`)

  - Verifies `admin-workspace-layout` is rendered.
  - Checks presence of primary navigation links: Dashboard, Projects, Logout.
  - Asserts that key metric cards are visible:
    - `admin-stat-total-projects`
    - `admin-stat-active-clients`

- **Admin project management** (`/admin/projects` and nested routes)
  - Ensures the project list/table (`admin-project-list`) is visible.
  - Opens the first project row via its "View/Open" link.
  - Confirms the project workspace view (`admin-project-workspace`) is shown, with an `h1` heading containing "Project".
  - Filters projects by status using `admin-project-filter-status`, selecting the `Active` option and verifying filtered rows (`admin-project-row`).

> **Implementation note:** These tests expect corresponding `data-testid` attributes in the admin React components (e.g., `AdminWorkspaceLayout`, `AdminProjectPage`). If an assertion fails because a test id is missing, update the component to include the expected `data-testid` or adjust the selector here.

## Client / Business Portal Coverage (`client.spec.ts`)

- **Client dashboard** (`/business`)

  - Verifies `business-workspace-layout` is rendered.
  - Checks navigation links for Dashboard and Projects.
  - Asserts that key stat cards are visible:
    - `business-stat-open-projects`
    - `business-stat-completed-projects`

- **Client project workspace** (`/business/projects` and nested routes)
  - Lists available projects via `business-project-list`.
  - Opens the first project link, then asserts `business-project-page` is rendered.
  - Ensures the main heading (`h1`) contains "Project".
  - Directly visits a project detail path (e.g., `/business/projects/1`) and checks:
    - `business-project-summary`
    - `business-project-timeline`
    - `business-project-team`

> **Implementation note:** Like the admin specs, the client specs assume that the corresponding components render `data-testid` attributes for stable selection.

## Auth and Session Assumptions

- The existing `auth.spec.ts` demonstrates how authentication is exercised.
- Admin and client specs are written assuming either:
  - the app starts in a state that trusts a local dev identity provider; or
  - a login helper/fixture is used to create an authenticated session before visiting protected routes.

If your environment requires a full Keycloak/OIDC round‑trip, prefer to:

1. Implement a reusable `loginAs(role)` helper in `frontend/tests/e2e/fixtures/auth.ts`.
2. Use Playwright fixtures to inject an authenticated `page` into admin/client suites.

## Extending Coverage

When adding new functionality, follow this checklist:

1. **Identify the route and role**

   - Decide whether the feature is admin‑only, client‑only, or shared.
   - Add or extend specs in the appropriate file (`admin.spec.ts` or `client.spec.ts`).

2. **Add stable selectors**

   - Prefer `data-testid` attributes on important interactive or assertion targets.
   - Keep naming consistent with existing patterns (e.g., `admin-*-*`, `business-*-*`).

3. **Model realistic user flows**

   - Use whole‑journey tests (navigate → act → verify outcome) instead of isolated DOM checks.
   - Avoid over‑asserting on minor styling details; focus on behavior and critical content.

4. **Run tests locally**

   - Start the frontend dev server or run a preview build.
   - Execute:

     ```powershell
     cd frontend
     npx playwright install
     npm run test:e2e
     ```

5. **Document new flows**
   - Update this file with a short bullet under **Admin Portal Coverage** or **Client / Business Portal Coverage** summarizing the new scenarios.

## Quick Reference for Agents

- **Where are Playwright specs?** `frontend/tests/e2e`.
- **How do I run them?** From `frontend/`: `npm run test:e2e`.
- **How do I inspect failures?** Open `frontend/playwright-report/index.html` after a run.
- **How do I add a new test?** Create or extend a spec file under `frontend/tests/e2e`, following the selector and structure conventions in `admin.spec.ts` and `client.spec.ts`.

This document should give agents enough context to understand how E2E coverage is organized, how admin vs. client functionality is exercised, and where to hook in future tests.
