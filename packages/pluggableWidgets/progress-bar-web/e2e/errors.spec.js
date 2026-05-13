import { test, expect } from "@mendix/run-e2e/fixtures";

test.describe("Progress Bar", () => {
    test("should render progress bar when there's no context", async ({ page }) => {
        await page.goto("p/noContext");
        const progressBar = await page.locator(".widget-progress-bar.mx-name-noContext .progress-bar");
        await expect(progressBar).toHaveText("0%");
    });
});
