import { test, expectWithAuth as expect } from './fixtures/auth';

// Smoke tests for meeting scheduling and tagging flows.
// These assume authenticated admin context via fixtures.

test.describe('Meeting scheduling', () => {
  test('admin schedules a meeting via calendar preset', async ({ adminPage }) => {
    // Navigate to a project workspace (fixture should provide at least one project row)
    const projectRow = adminPage.getByTestId('admin-project-row').first();
    await expect(projectRow).toBeVisible();
    await projectRow.click();
    await expect(adminPage.getByTestId('admin-project-workspace')).toBeVisible();

    // Open scheduling tab if needed
    const scheduleNav = adminPage.getByRole('link', { name: /Schedule/i }).first();
    if (await scheduleNav.isVisible()) {
      await scheduleNav.click();
    }

    // Calendar present
    const calendar = adminPage.getByRole('heading', { name: /Calendar/i });
    await expect(calendar).toBeVisible();

    // Pick a day cell (uses button with day number)
    const dayButton = adminPage.locator('button', { hasText: /^15$/ }).first();
    if (await dayButton.isVisible()) {
      await dayButton.click();
    }

    // Fill summary
    const summaryInput = adminPage.getByLabel(/Title|summary/i).first();
    await summaryInput.fill('Review cadence sync');

    // Submit meeting
    const submitBtn = adminPage.getByRole('button', { name: /Add meeting/i });
    await Promise.all([
      adminPage.waitForResponse((r) => /\/api\/projects\/.+\/meetings$/.test(r.url()) && r.request().method() === 'POST' && r.ok()),
      submitBtn.click(),
    ]);

    // Verify appears in upcoming
    const upcoming = adminPage.getByText(/Review cadence sync/i);
    await expect(upcoming).toBeVisible();
  });
});

test.describe('Tagging', () => {
  test('attach tag to epic (create-on-attach)', async ({ adminPage }) => {
    const projectRow = adminPage.getByTestId('admin-project-row').first();
    await expect(projectRow).toBeVisible();
    await projectRow.click();
    await expect(adminPage.getByTestId('admin-project-workspace')).toBeVisible();

    // Open epics panel
    const epicPanel = adminPage.getByTestId('project-epics-panel');
    await expect(epicPanel).toBeVisible();
    const firstEpic = epicPanel.getByTestId('epic-row').first();
    await expect(firstEpic).toBeVisible();

    // Open tag controls (assumes a button or link)
    const tagButton = firstEpic.getByRole('button', { name: /tags/i });
    if (await tagButton.isVisible()) {
      await tagButton.click();
    }

    // Create new tag via input fields (name + type select)
    const nameInput = adminPage.getByPlaceholder(/Tag name/i).first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Regulatory');
    }
    const typeSelect = adminPage.getByRole('combobox', { name: /Type/i }).first();
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('REGULATORY');
    }

    const attachBtn = adminPage.getByRole('button', { name: /Attach tag/i }).first();
    await Promise.all([
      adminPage.waitForResponse((r) => /\/api\/projects\/.+\/epics\/.+\/tags$/.test(r.url()) && r.request().method() === 'POST' && r.ok()),
      attachBtn.click(),
    ]);

    const chip = firstEpic.getByText(/Regulatory/i);
    await expect(chip).toBeVisible();
  });

  test('attach tag to story (existing tag)', async ({ adminPage }) => {
    const projectRow = adminPage.getByTestId('admin-project-row').first();
    await expect(projectRow).toBeVisible();
    await projectRow.click();

    const storiesPanel = adminPage.getByTestId('project-stories-panel');
    await expect(storiesPanel).toBeVisible();
    const firstStory = storiesPanel.getByTestId('story-row').first();
    await expect(firstStory).toBeVisible();

    // Open story tag controls
    const tagButton = firstStory.getByRole('button', { name: /tags/i });
    if (await tagButton.isVisible()) {
      await tagButton.click();
    }

    // Select previously created tag
    const tagSelect = adminPage.getByRole('combobox', { name: /Existing tag/i }).first();
    if (await tagSelect.isVisible()) {
      await tagSelect.selectOption({ label: 'Regulatory' });
    }

    const attachBtn = adminPage.getByRole('button', { name: /Attach tag/i }).first();
    await Promise.all([
      adminPage.waitForResponse((r) => /\/api\/projects\/.+\/stories\/.+\/tags$/.test(r.url()) && r.request().method() === 'POST' && r.ok()),
      attachBtn.click(),
    ]);

    const chip = firstStory.getByText(/Regulatory/i);
    await expect(chip).toBeVisible();
  });
});
