import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Progress Bar", () => {
    test("should render progress bar when there's no context", async ({ page }) => {
        await page.goto("p/noContext");
        const progressBar = await page.locator(".widget-progress-bar.mx-name-noContext .progress-bar");
        await expect(progressBar).toHaveText("0%");
    });
});
