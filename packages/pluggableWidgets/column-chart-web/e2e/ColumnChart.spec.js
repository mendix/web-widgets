import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("column-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
        await page.locator(".mx-name-actionButton1").click();
        await waitForMendixApp(page);
    });

    test.describe("column color", () => {
        test("renders column chart with default color and compares with a screenshot baseline", async ({ page }) => {
            const defaultColorContainer = page.locator(".mx-name-containerDefaultColor .widget-chart");
            await defaultColorContainer.scrollIntoViewIfNeeded();
            await expect(defaultColorContainer).toBeVisible({ timeout: 10000 });
            await expect(defaultColorContainer.locator(".plot-container")).toBeVisible();
            await expect(defaultColorContainer).toHaveScreenshot(`columnChartDefaultColor.png`);
        });

        test("renders column chart with custom color and compares with a screenshot baseline", async ({ page }) => {
            const customColorContainer = page.locator(".mx-name-containerCustomColor .widget-chart");
            await customColorContainer.scrollIntoViewIfNeeded();
            await expect(customColorContainer).toBeVisible({ timeout: 10000 });
            await expect(customColorContainer.locator(".plot-container")).toBeVisible();
            await expect(customColorContainer).toHaveScreenshot(`columnChartCustomColor.png`);
        });
    });

    test.describe("column format", () => {
        test("renders column chart with grouped format and compares with a screenshot baseline", async ({ page }) => {
            const groupContainer = page.locator(".mx-name-containerGroup .widget-chart");
            await groupContainer.scrollIntoViewIfNeeded();
            await expect(groupContainer).toBeVisible({ timeout: 10000 });
            await expect(groupContainer.locator(".plot-container")).toBeVisible();
            await expect(groupContainer).toHaveScreenshot(`columnChartGrouped.png`);
        });

        test("renders column chart with stacked format and compares with a screenshot baseline", async ({ page }) => {
            const stackContainer = page.locator(".mx-name-containerStack .widget-chart");
            await stackContainer.scrollIntoViewIfNeeded();
            await expect(stackContainer).toBeVisible({ timeout: 10000 });
            await expect(stackContainer.locator(".plot-container")).toBeVisible();
            await expect(stackContainer).toHaveScreenshot(`columnChartStacked.png`);
        });
    });
});
