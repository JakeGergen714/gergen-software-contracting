import { test as base, expect, Page } from '@playwright/test';
import { TestApiClient } from './apiClient';

interface Credentials {
  username: string;
  password: string;
}

export const adminCreds: Credentials = {
  username: process.env.E2E_ADMIN_USERNAME ?? 'test',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'test',
};

export const clientCreds: Credentials = {
  username: process.env.E2E_CLIENT_USERNAME ?? 'test',
  password: process.env.E2E_CLIENT_PASSWORD ?? 'test',
};

async function performKeycloakLogin(page: Page, targetPath: string, creds: Credentials) {
  await page.addInitScript(`
    (function(){
      try {
        window.__E2E_DISABLE_SILENT_SSO = true;
        window.localStorage.setItem('portal:disableSilentSso', 'true');
        window.sessionStorage.clear();
      } catch (err) {
        // ignore
      }
    })();
  `);

  await page.goto(targetPath);

  if (!page.url().includes('/login')) {
    return;
  }

  const continueButton = page.getByRole('button', { name: /Continue with SSO/i });
  await expect(continueButton).toBeVisible();
  const popupPromise = page.waitForEvent('popup').catch(() => null);
  await continueButton.click();
  const authPage = (await popupPromise) ?? page;

  await authPage.waitForURL('**/realms/**', { timeout: 60_000 });
  await authPage.locator('#username').fill(creds.username);
  await authPage.locator('#password').fill(creds.password);
  await authPage.locator('#kc-login').click();

  await page.waitForLoadState('networkidle');
}

type Fixtures = {
  apiClient: TestApiClient;
  adminPage: Page;
  clientPage: Page;
};

export const test = base.extend<Fixtures>({
  apiClient: async ({}, use) => {
    const client = await TestApiClient.create();
    await use(client);
  },

  adminPage: async ({ page, apiClient }, use) => {
    await apiClient.reset();
    await apiClient.createAdminSampleProject();
    await performKeycloakLogin(page, '/admin', adminCreds);
    await use(page);
  },

  clientPage: async ({ page, apiClient }, use) => {
    await apiClient.reset();
    await performKeycloakLogin(page, '/business', clientCreds);
    await use(page);
  },
});

export const expectWithAuth = expect;
