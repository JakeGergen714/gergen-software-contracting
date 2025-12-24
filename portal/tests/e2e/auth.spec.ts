import { expect, test, Page } from '@playwright/test';

interface Credentials {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const adminUser: Credentials = {
  username: process.env.E2E_KEYCLOAK_USERNAME ?? 'admin@example.com',
  password: process.env.E2E_KEYCLOAK_PASSWORD ?? 'admin',
  firstName: 'Portal',
  lastName: 'Admin',
};

const clientUser: Credentials = {
  username: process.env.E2E_CLIENT_USERNAME ?? 'client@example.com',
  password: process.env.E2E_CLIENT_PASSWORD ?? 'client',
  firstName: 'Portal',
  lastName: 'Client',
};

async function visitWithLogin(page: Page, targetPath: string, creds: Credentials) {
  await page.addInitScript(`
    (function(){
      window.__E2E_DISABLE_SILENT_SSO = true;
      try {
        window.localStorage.setItem('portal:disableSilentSso', 'true');
        const alreadyCleared = window.sessionStorage.getItem('__e2e_session_initialized');
        if (!alreadyCleared) {
          window.sessionStorage.clear();
          window.sessionStorage.setItem('__e2e_session_initialized', 'true');
        }
      } catch (err) {
        // ignore storage errors (e.g., Safari private mode)
      }
    })();
  `);
  await page.goto(targetPath);

  if (!page.url().includes('/login')) {
    return; // Already authenticated or public route
  }

  const continueButton = page.getByRole('button', { name: /Continue with SSO/i });
  await expect(continueButton).toBeVisible();

  const popupPromise = page
    .waitForEvent('popup', { timeout: 5000 })
    .catch(() => null);
  await continueButton.click();
  const authPage = (await popupPromise) ?? page;

  await authPage.waitForURL('**/realms/**', { timeout: 60_000 });
  await authPage.locator('#username').fill(creds.username);
  await authPage.locator('#password').fill(creds.password);

  const sessionRequest = page
    .waitForResponse((response) => {
      return (
        response.url().includes('/api/businesses/') &&
        response.url().endsWith('/overview') &&
        response.request().method() === 'GET' &&
        response.ok()
      );
    }, { timeout: 60_000 })
    .catch(() => null);

  await authPage.locator('#kc-login').click();

  const profileUpdateVisible = await authPage
    .getByRole('heading', { name: /Update Account Information/i })
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (profileUpdateVisible) {
    const firstName = creds.firstName ?? 'Test';
    const lastName = creds.lastName ?? 'User';
    await authPage.getByLabel('First name').fill(firstName);
    await authPage.getByLabel('Last name').fill(lastName);
    await authPage.getByRole('button', { name: /^Submit$/i }).click();
  }
  await sessionRequest;
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('button', { name: 'Logout' })
  ).toBeVisible({ timeout: 60_000 });

  const navTarget = targetPath.startsWith('/admin')
    ? page.getByRole('link', { name: 'Admin' })
    : targetPath.startsWith('/business')
      ? page.getByRole('link', { name: 'Business' })
      : null;

  if (navTarget) {
    await navTarget.click();
    const basePath = targetPath.startsWith('/admin') ? '/admin' : '/business';
    await page.waitForURL(
      (url) => new URL(url).pathname.startsWith(basePath),
      { timeout: 60_000 }
    );
    if (targetPath !== basePath) {
      await page.waitForURL(`**${targetPath}`, { timeout: 60_000 });
    }
  } else {
    await page.goto(targetPath, { waitUntil: 'networkidle' });
  }
}

test.describe('Portal authentication', () => {
  test('admin can reach admin dashboard', async ({ page }) => {
    page.on('console', (msg) => {
      console.log(`[browser:${msg.type()}] ${msg.text()}`);
    });
    await visitWithLogin(page, '/admin', adminUser);
    await expect(
      page.getByRole('heading', { name: 'Portfolio overview' })
    ).toBeVisible({ timeout: 60_000 });

    const manageLink = page.getByRole('link', { name: /^Manage$/ }).first();
    await manageLink.click();
    await page.waitForURL('**/admin/projects/**/overview', { timeout: 60_000 });

    const executionButton = page.getByRole('button', { name: 'Execution' });
    await expect(executionButton).toBeVisible();
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().match(/\/api\/projects\/.+\/stage$/) !== null &&
        response.request().method() === 'PUT' &&
        response.ok()
      ),
      executionButton.click(),
    ]);
    await expect(executionButton).toBeDisabled();

    const planningButton = page.getByRole('button', { name: 'Planning' });
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().match(/\/api\/projects\/.+\/stage$/) !== null &&
        response.request().method() === 'PUT' &&
        response.ok()
      ),
      planningButton.click(),
    ]);
    await expect(planningButton).toBeDisabled();
  });

  test('client user can reach business workspace', async ({ page }) => {
    page.on('console', (msg) => {
      console.log(`[browser:${msg.type()}] ${msg.text()}`);
    });
    await visitWithLogin(page, '/business', clientUser);
    await expect(
      page.getByText('Business workspace', { exact: false })
    ).toBeVisible({ timeout: 60_000 });
  });
});
