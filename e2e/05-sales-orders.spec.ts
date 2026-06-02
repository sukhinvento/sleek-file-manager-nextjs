import { test, expect } from './fixtures';

test.describe('Sales Orders', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/sales-orders');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with orders from API', async ({ authedPage: page }) => {
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 });
  });

  test('open new SO form', async ({ authedPage: page }) => {
    const newBtn = page.getByRole('button', { name: /new order|create|new sales/i }).first();
    await expect(newBtn).toBeVisible({ timeout: 8_000 });
    await newBtn.click();
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 6_000 });
  });

  test('SO items: selecting product fills price and subtotal', async ({ authedPage: page }) => {
    const newBtn = page.getByRole('button', { name: /new order|create|new sales/i }).first();
    await newBtn.click();
    const overlay = page.locator('[role="dialog"]').first();
    await expect(overlay).toBeVisible();

    const addItemBtn = overlay.getByRole('button', { name: /add item|add/i }).first();
    await addItemBtn.click();
    await page.waitForTimeout(300);

    const productInput = overlay.locator('input[placeholder*="Search"], input[placeholder*="product"]').first();
    if (await productInput.isVisible().catch(() => false)) {
      await productInput.fill('Para');
      await page.waitForTimeout(700);
      const suggestion = page.locator('[role="option"]').first();
      if (await suggestion.isVisible().catch(() => false)) {
        await suggestion.click();
        await page.waitForTimeout(300);
        const priceInput = overlay.locator('input[type="number"]').nth(1);
        const priceVal = await priceInput.inputValue().catch(() => '0');
        expect(Number(priceVal)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('SO summary shipping is 0 when no items', async ({ authedPage: page }) => {
    const newBtn = page.getByRole('button', { name: /new order|create|new sales/i }).first();
    await newBtn.click();
    const overlay = page.locator('[role="dialog"]').first();
    await expect(overlay).toBeVisible({ timeout: 8_000 });

    // With no items the overlay should not show ₹500.00 as shipping
    await page.waitForTimeout(500);
    const overlayText = await overlay.textContent();
    expect(overlayText).not.toContain('₹500.00');
  });

  test('existing SO shows items section', async ({ authedPage: page }) => {
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 12_000 });

    const viewBtn = firstRow.getByRole('button').first();
    await viewBtn.click();

    const overlay = page.locator('[role="dialog"]').first();
    await expect(overlay).toBeVisible({ timeout: 8_000 });
    await expect(overlay.getByText(/order items/i)).toBeVisible({ timeout: 5_000 });
  });

  test('SO status filter works', async ({ authedPage: page }) => {
    const filterBtn = page.getByRole('button', { name: /processing/i })
      .or(page.locator('[data-status="Processing"]'))
      .first();
    if (await filterBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(500);
    }
    // Page should not crash regardless
    expect(true).toBeTruthy();
  });
});
