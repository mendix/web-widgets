import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("heatmap-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test.describe("heatmap color", { viewport: { height: 720, width: 1280 } }, async () => {
        test("renders heatmap chart with custom color and compares with a screenshot baseline", async ({ page }) => {
            const customColorContainer = await page.locator(".mx-name-containerCustomColor");
            await expect(customColorContainer).toBeVisible({ timeout: 10000 });
            await customColorContainer.scrollIntoViewIfNeeded();
            await expect(customColorContainer).toHaveScreenshot(`heatmapChartCustomColor.png`, {
                threshold: 0.5
            });
        });
    });

    test.describe("heatmap sort order", { viewport: { height: 720, width: 1280 } }, async () => {
        test("renders heatmap chart with ascending order and compares with a screenshot baseline", async ({ page }) => {
            const ascendingContainer = await page.locator(".mx-name-containerAscending");
            await expect(ascendingContainer).toBeVisible({ timeout: 10000 });
            await ascendingContainer.scrollIntoViewIfNeeded();
            await expect(ascendingContainer).toHaveScreenshot(`heatmapChartAscending.png`, {
                threshold: 0.5
            });
        });

        test("renders heatmap chart with descending order and compares with a screenshot baseline", async ({
            page
        }) => {
            const descendingContainer = await page.locator(".mx-name-containerDescending");
            await descendingContainer.scrollIntoViewIfNeeded();
            await expect(descendingContainer).toHaveScreenshot(`heatmapChartDescending.png`, {
                threshold: 0.5
            });
        });
    });
});
