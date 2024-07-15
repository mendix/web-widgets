import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("combobox-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.waitForLoadState("networkidle");
        await page.click(".mx-name-actionButton1");
    });

    test.describe("data source types", () => {
        test("renders combobox using association", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox1");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxAssociation.png`);
        });

        test("renders combobox using enum", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox2");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxEnum.png`);
        });

        test("renders combobox using boolean", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox3");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxBoolean.png`);
        });
    });
});
