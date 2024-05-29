import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("badge-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/callNanoflow");
    });

    test("should call nanoflow on click badge", async ({ page }) => {
        const badge = ".mx-name-badgeCallNanoflow";
        await expect(page.locator(badge)).toBeVisible();
        await page.locator(badge).click();

        const dialog = ".modal-body";
        await expect(page.locator(dialog)).toBeVisible();

        await expect(
            page
                .locator("div")
                .filter({ hasText: /^Data stringNewSuccess$/ })
                .locator("div")
        ).toContainText("NewSuccess");
    });

    test("should call nanoflow on click label", async ({ page }) => {
        const badge = ".mx-name-labelCallNanoflow";
        await expect(page.locator(badge)).toBeVisible();
        await page.locator(badge).click();

        const dialog = ".modal-body";
        await expect(page.locator(dialog)).toBeVisible();

        await expect(
            page
                .locator("div")
                .filter({ hasText: /^Data stringNewSuccess$/ })
                .locator("div")
        ).toContainText("NewSuccess");
    });
});
