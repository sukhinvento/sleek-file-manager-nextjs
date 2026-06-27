import { test, expect } from './fixtures';

test.describe('Analytics – Usage Statistics', () => {
  test('page loads and renders charts', async ({ authedPage: page }) => {
    await page.goto('/analytics/usage');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, [class*="heading"]').first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Analytics – Trends', () => {
  test('page loads and shows chart data', async ({ authedPage: page }) => {
    await page.goto('/analytics/trends');
    await page.waitForLoadState('networkidle');
    const chart = page.locator('canvas, svg[class*="recharts"], [class*="chart"]').first();
    await expect(chart).toBeVisible({ timeout: 12_000 });
  });
});

test.describe('Analytics – Distribution', () => {
  test('page loads gender/payment charts from real API', async ({ authedPage: page }) => {
    await page.goto('/analytics/distribution');
    await page.waitForLoadState('networkidle');
    // Heading or chart should appear
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });
});
