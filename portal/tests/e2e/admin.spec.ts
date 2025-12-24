import { test, expectWithAuth as expect } from './fixtures/auth';

// Admin portal E2E coverage
// These tests assume an already-authenticated admin session or a test login helper.
// If your environment requires real Keycloak/OIDC, wire a proper login flow
// similar to the existing auth.spec.ts.

// Smoke test: admin dashboard layout and key widgets
test.describe('Admin dashboard', () => {
  test('loads dashboard with key cards and navigation', async ({ adminPage }) => {

    // Layout frame
    await expect(adminPage.getByTestId('admin-workspace-layout')).toBeVisible();

    // Global nav
    await expect(adminPage.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(adminPage.getByRole('link', { name: /projects/i })).toBeVisible();
    await expect(adminPage.getByRole('link', { name: /logout/i })).toBeVisible();

    // High‑level stats cards (by ARIA or test ids)
    await expect(adminPage.getByTestId('admin-stat-total-projects')).toBeVisible();
    await expect(adminPage.getByTestId('admin-stat-active-clients')).toBeVisible();
  });
});

// Project administration flows
test.describe('Admin project management', () => {
  test('lists projects and opens project workspace', async ({ adminPage }) => {

    // Project table/list
    const projectTable = adminPage.getByTestId('admin-project-list');
    await expect(projectTable).toBeVisible();

    const firstRow = projectTable.getByRole('row').nth(1);
    await expect(firstRow).toBeVisible();

    // Open first project
    await firstRow.getByRole('link', { name: /view|open/i }).click();

    // Project workspace view
    await expect(adminPage.getByTestId('admin-project-workspace')).toBeVisible();
    await expect(adminPage.getByRole('heading', { level: 1 })).toContainText(/project/i);
  });

  test('filters projects by status', async ({ adminPage }) => {

    const statusFilter = adminPage.getByTestId('admin-project-filter-status');
    await expect(statusFilter).toBeVisible();

    await statusFilter.click();
    await adminPage.getByRole('option', { name: /active/i }).click();

    const rows = adminPage.getByTestId('admin-project-row');
    await expect(rows.first()).toBeVisible();

    // Optional: add an assertion that all visible rows show status "Active"
  });
});
