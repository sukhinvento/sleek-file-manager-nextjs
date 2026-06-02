import { test, expect } from './fixtures';

test.describe('Hospital Dashboard', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('renders stat cards', async ({ authedPage: page }) => {
    // Cards are inside main, not the AppLayout bg-card header
    const cards = page.locator('main [class*="card"], main [class*="Card"], main [class*="stat"]').first();
    await expect(cards).toBeVisible({ timeout: 12_000 });
  });

  test('inventory dashboard loads charts', async ({ authedPage: page }) => {
    await page.goto('/inventory-dashboard');
    await page.waitForLoadState('networkidle');
    const chart = page.locator('canvas, svg.recharts-surface').first();
    await expect(chart).toBeVisible({ timeout: 12_000 });
  });
});
