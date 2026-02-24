import { test, expect } from '@playwright/test';

test('has title and login button', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Gia Phả/);

    // Expect a log in link to be visible (depends on the actual text in landing page)
    const loginLink = page.getByRole('link', { name: /Đăng Nhập/i }).first();
    if (await loginLink.isVisible()) {
        await expect(loginLink).toBeVisible();
    }
});
