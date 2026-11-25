import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("heatmap-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
    });

    test.describe("heatmap color", { viewport: { height: 720, width: 1280 } }, async () => {
        test("renders heatmap chart with custom color and compares with a screenshot baseline", async ({ page }) => {
            const customColorContainer = await page.locator(".mx-name-containerCustomColor");
            await expect(customColorContainer).toBeVisible({ timeout: 10000 });
            await customColorContainer.scrollIntoViewIfNeeded();
            await expect(customColorContainer.locator(".mx-react-plotly-chart")).toBeVisible({ timeout: 5000 });
            await expect(customColorContainer.locator("g.colorbar")).toBeVisible({ timeout: 5000 });
            await expect(customColorContainer.locator("g.cbaxis")).toBeVisible({ timeout: 5000 });
            await expect(customColorContainer).toHaveScreenshot(`heatmapChartCustomColor.png`);
        });
    });

    // Axis titles don't render: Plotly receives the title as { text: { text: "..." } }.
    test.fixme("renders the x axis title", async ({ page }) => {
        const xAxisTitle = page.locator(".mx-name-containerCustomColor g.g-xtitle");
        await expect(xAxisTitle).toHaveText("X axis label");
    });

    test.describe("heatmap sort order", { viewport: { height: 720, width: 1280 } }, async () => {
        test("renders heatmap chart with ascending order and compares with a screenshot baseline", async ({ page }) => {
            const ascendingContainer = await page.locator(".mx-name-containerAscending");
            await expect(ascendingContainer).toBeVisible({ timeout: 10000 });
            await ascendingContainer.scrollIntoViewIfNeeded();
            await expect(ascendingContainer.locator(".mx-react-plotly-chart")).toBeVisible({ timeout: 5000 });
            await expect(ascendingContainer.locator("g.colorbar")).toBeVisible({ timeout: 5000 });
            await expect(ascendingContainer.locator("g.cbaxis")).toBeVisible({ timeout: 5000 });
            await expect(ascendingContainer).toHaveScreenshot(`heatmapChartAscending.png`);
        });

        test("renders heatmap chart with descending order and compares with a screenshot baseline", async ({
            page
        }) => {
            const descendingContainer = await page.locator(".mx-name-containerDescending");
            await expect(descendingContainer).toBeVisible({ timeout: 10000 });
            await descendingContainer.scrollIntoViewIfNeeded();
            await expect(descendingContainer.locator(".mx-react-plotly-chart")).toBeVisible({ timeout: 5000 });
            await expect(descendingContainer.locator("g.colorbar")).toBeVisible({ timeout: 5000 });
            await expect(descendingContainer.locator("g.cbaxis")).toBeVisible({ timeout: 5000 });
            await expect(descendingContainer).toHaveScreenshot(`heatmapChartDescending.png`);
        });
    });
});
