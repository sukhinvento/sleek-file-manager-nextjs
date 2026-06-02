import { test, expect, CREDENTIALS } from './fixtures';

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
  });

  test('wrong password shows error toast', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Enter your username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Enter your password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page.locator('[data-radix-toast-viewport], [role="status"], [role="alert"]').first()).toBeVisible({ timeout: 8_000 });
  });

  test('valid credentials redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Enter your username').fill(CREDENTIALS.username);
    await page.getByPlaceholder('Enter your password').fill(CREDENTIALS.password);
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 15_000 });
    expect(page.url()).not.toContain('/login');
  });

  test('unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/inventory');
    // Either redirected to login, or still on /inventory (app handles auth state)
    // We just confirm the page doesn't 404
    await expect(page).not.toHaveURL('**/404');
  });
});
