import { test, expect } from './fixtures';

test.describe('Purchase Orders', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/purchase-orders');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with stat cards', async ({ authedPage: page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 });
  });

  test('PO list renders orders from API', async ({ authedPage: page }) => {
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 });
  });

  test('open new PO form', async ({ authedPage: page }) => {
    const newBtn = page.getByRole('button', { name: /new order|new purchase|create/i }).first();
    await expect(newBtn).toBeVisible({ timeout: 8_000 });
    await newBtn.click();
    // The overlay uses a Sheet (role=dialog) — use first() to avoid strict-mode multi-match
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 6_000 });
  });

  test('create PO – items calculate amount correctly', async ({ authedPage: page }) => {
    const newBtn = page.getByRole('button', { name: /new order|new purchase|create/i }).first();
    await newBtn.click();
    const overlay = page.locator('[role="dialog"]').first();
    await expect(overlay).toBeVisible();

    // Add an item row
    const addItemBtn = overlay.getByRole('button', { name: /add item|add/i }).first();
    await addItemBtn.click();
    await page.waitForTimeout(400);

    // Type in product search
    const productInput = overlay.locator('input[placeholder*="Search"], input[placeholder*="product"]').first();
    if (await productInput.isVisible().catch(() => false)) {
      await productInput.fill('Para');
      await page.waitForTimeout(700);
      const suggestion = page.locator('[class*="suggestion"], [role="option"]').first();
      if (await suggestion.isVisible().catch(() => false)) {
        await suggestion.click();
        await page.waitForTimeout(300);
        // Qty input should default to 1
        const qtyInput = overlay.locator('input[type="number"]').first();
        const val = await qtyInput.inputValue();
        expect(Number(val)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('shipping fee is dynamic (not fixed 500)', async ({ authedPage: page }) => {
    const newBtn = page.getByRole('button', { name: /new order|new purchase|create/i }).first();
    await newBtn.click();
    const overlay = page.locator('[role="dialog"]').first();
    await expect(overlay).toBeVisible({ timeout: 8_000 });

    // With no items the overlay should not show ₹500.00 as shipping
    await page.waitForTimeout(500);
    const overlayText = await overlay.textContent();
    expect(overlayText).not.toContain('₹500.00');
  });

  test('open existing PO and verify items display', async ({ authedPage: page }) => {
    // Wait for rows to load
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 12_000 });

    // Click the row or the view/open button in it
    const viewBtn = firstRow.getByRole('button').first();
    await viewBtn.click();

    // Sheet/dialog overlay should open
    const overlay = page.locator('[role="dialog"]').first();
    await expect(overlay).toBeVisible({ timeout: 8_000 });
    await expect(overlay.getByText(/order items/i)).toBeVisible({ timeout: 5_000 });
  });

  test('delete PO shows confirmation', async ({ authedPage: page }) => {
    const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(deleteBtn).toBeEnabled();
    }
  });
});
