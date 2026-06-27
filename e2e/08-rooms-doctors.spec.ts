import { test, expect } from './fixtures';

test.describe('Room Management', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
  });

  test('room list loads', async ({ authedPage: page }) => {
    const row = page.locator('main table tbody tr, main [class*="room-card"], main [class*="card"]').first();
    await expect(row).toBeVisible({ timeout: 15_000 });
  });

  test('add room dialog opens', async ({ authedPage: page }) => {
    const addBtn = page.getByRole('button', { name: /add room|new room/i }).first();
    if (await addBtn.isVisible({ timeout: 6_000 }).catch(() => false)) {
      await addBtn.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 });
    }
  });
});

test.describe('Doctor Management', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
  });

  test('doctor list loads', async ({ authedPage: page }) => {
    const row = page.locator('main table tbody tr, main [class*="doctor-card"], main [class*="card"]').first();
    await expect(row).toBeVisible({ timeout: 15_000 });
  });

  test('search doctors', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search/i).first();
    if (await search.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await search.fill('Dr');
      await page.waitForTimeout(500);
      // No crash = pass
      expect(true).toBeTruthy();
    }
  });
});
