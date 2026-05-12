import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should display the app title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'banned-hint' })).toBeVisible();
  });

  test('should load successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });
});
