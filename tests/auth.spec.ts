import { test, expect } from '@playwright/test';

test('login page has email and password inputs', async ({ page }) => {
    await page.goto('/login');

    // Verify form inputs exist
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Mật khẩu/i)).toBeVisible();

    // Verify submit button exists
    await expect(page.getByRole('button', { name: /Đăng nhập/i })).toBeVisible();
});
