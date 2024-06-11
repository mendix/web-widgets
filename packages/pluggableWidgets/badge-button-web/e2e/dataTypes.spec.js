import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("BadgeButton different data types", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("p/dataTypes");
        await page.waitForLoadState("networkidle");
    });

    test("displays correctly string data", async ({ page }) => {
        const badgeButton = ".mx-name-badgeButtonString";
        await expect(page.locator(badgeButton)).toBeVisible();
        await expect(page.locator(`${badgeButton} .widget-badge-button-text`)).toContainText("Button");
        await expect(page.locator(`${badgeButton} .badge`)).toContainText("New");
    });

    test("displays correctly integer data", async ({ page }) => {
        const badgeButton = ".mx-name-badgeButtonInteger";
        await expect(page.locator(badgeButton)).toBeVisible();
        await expect(page.locator(`${badgeButton} .widget-badge-button-text`)).toContainText("Caption");
        await expect(page.locator(`${badgeButton} .badge`)).toContainText("10");
    });

    test("displays correctly long data", async ({ page }) => {
        const badgeButton = ".mx-name-badgeButtonLong";
        await expect(page.locator(badgeButton)).toBeVisible();
        await expect(page.locator(`${badgeButton} .widget-badge-button-text`)).toContainText("Caption");
        await expect(page.locator(`${badgeButton} .badge`)).toContainText("2,147,483,647");
    });

    test("displays correctly decimal data", async ({ page }) => {
        const badgeButton = ".mx-name-badgeButtonDecimal";
        await expect(page.locator(badgeButton)).toBeVisible();
        await expect(page.locator(`${badgeButton} .widget-badge-button-text`)).toContainText("Caption");
        await expect(page.locator(`${badgeButton} .badge`)).toContainText("2.5");
    });
});
