import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Rating", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("compares with a screenshot baseline and checks if all rating elements are rendered as expected", async ({
        page
    }) => {
        await expect(page.locator(".mx-name-rating1")).toBeVisible();
        await expect(page.locator(".mx-name-ratingContent")).toHaveScreenshot(`ratingPageContent.png`);
    });
});
