import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.beforeEach(async ({ page }) => {
    await page.goto("/");
});

test.describe("Badge:", function () {
    test("visual comparison", async ({ page }) => {
        // Visual Comparison.
        await expect(page.locator(".mx-name-badgeDanger")).toBeVisible();
        await expect(page).toHaveScreenshot("badge.png");
    });

    test("changes badge caption when attribute value is changed", async ({ page }) => {
        const badge = page.locator(".mx-name-badgeDanger");
        const dataInput = page.locator(".mx-name-dataInput input");

        await dataInput.fill("Test");
        await dataInput.press("Enter");
        await expect(badge).toHaveText("Test");
    });

    test("changes label caption when attribute value is changed", async ({ page }) => {
        const badgeLabel = page.locator(".mx-name-labelDanger");
        const dataInput = page.locator(".mx-name-dataInput input");

        await dataInput.fill("Test");
        await dataInput.press("Enter");
        await expect(badgeLabel).toHaveText("Test");
    });
});
