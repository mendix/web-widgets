import { test, expect } from "@playwright/test";

test.describe("heatmap-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("heatmap color", { viewport: { height: 720, width: 1280 } }, async () => {
        test("renders heatmap chart with custom color and compares with a screenshot baseline", async ({ page }) => {
            const customColorContainer = await page.$(".mx-name-containerCustomColor");
            await expect(customColorContainer).toBeVisible({ timeout: 10000 });
            await customColorContainer.scrollIntoViewIfNeeded();
            await expect(customColorContainer).toHaveScreenshot(`heatmapChartCustomColor-${page.browser().name}`, {
                threshold: 0.5
            });
        });
    });

    test.describe("heatmap sort order", { viewport: { height: 720, width: 1280 } }, async () => {
        test("renders heatmap chart with ascending order and compares with a screenshot baseline", async ({ page }) => {
            const ascendingContainer = await page.$(".mx-name-containerAscending");
            await expect(ascendingContainer).toBeVisible({ timeout: 10000 });
            await ascendingContainer.scrollIntoViewIfNeeded();
            await expect(ascendingContainer).toHaveScreenshot(`heatmapChartAscending-${page.browser().name}`, {
                threshold: 0.5
            });
        });

        test("renders heatmap chart with descending order and compares with a screenshot baseline", async ({
            page
        }) => {
            const descendingContainer = await page.$(".mx-name-containerDescending");
            await descendingContainer.scrollIntoViewIfNeeded();
            await expect(descendingContainer).toHaveScreenshot(`heatmapChartDescending-${page.browser().name}`, {
                threshold: 0.5
            });
        });
    });
});
