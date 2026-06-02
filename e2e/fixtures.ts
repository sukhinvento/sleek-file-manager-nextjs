import { test as base, expect, Page } from '@playwright/test';

export const CREDENTIALS = { username: 'admin@company.com', password: 'Admin123!' };
export const BASE = 'http://localhost:8080';

async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('Enter your username').fill(CREDENTIALS.username);
  await page.getByPlaceholder('Enter your password').fill(CREDENTIALS.password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 15_000 });
}

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});

export { expect };
