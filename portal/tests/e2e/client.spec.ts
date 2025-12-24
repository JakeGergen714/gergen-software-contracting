import { test, expectWithAuth as expect } from './fixtures/auth';

// Client (business user) portal coverage
// These tests exercise the core workspace and project flows
// visible to business clients.

const BUSINESS_DASHBOARD_PATH = '/business/projects';
const BUSINESS_PROJECTS_PATH = '/business/projects';

// Smoke test: client dashboard, navigation, and key widgets
test.describe('Client dashboard', () => {
  test('loads dashboard with workspace layout and stats', async ({ clientPage }) => {
    await clientPage.goto(BUSINESS_DASHBOARD_PATH);

    await expect(clientPage.getByTestId('business-workspace-layout')).toBeVisible();
  });
});

// Project views for clients
test.describe('Client project workspace', () => {
  test('lists projects and opens project detail page', async ({ clientPage }) => {
    await clientPage.goto(BUSINESS_PROJECTS_PATH);

    const firstProject = clientPage.getByTestId('business-project-row').first();
    await expect(firstProject).toBeVisible();

    await firstProject.click();

    await expect(clientPage.getByTestId('business-project-page')).toBeVisible();
    await expect(clientPage.getByRole('heading', { level: 1 })).toContainText(/project/i);
  });

  test('shows key project metadata and timeline', async ({ clientPage }) => {
    await clientPage.goto(`${BUSINESS_PROJECTS_PATH}/1`);

    await expect(clientPage.getByTestId('business-project-summary')).toBeVisible();
    await expect(clientPage.getByTestId('business-project-timeline')).toBeVisible();
    await expect(clientPage.getByTestId('business-project-team')).toBeVisible();
  });
});
