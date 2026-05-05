import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("time-series-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
    });

    test("renders time series chart with multiple series and compares with a screenshot baseline", async ({ page }) => {
        await expect(page.locator(".mx-name-containerMultipleSeries", { timeout: 10000 })).toBeVisible();
        await page.locator(".mx-name-containerMultipleSeries").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-containerMultipleSeries")).toHaveScreenshot(
            `timeSeriesChartMultipleSeries.png`
        );
    });

    test("renders time series chart without range slider and compares with a screenshot baseline", async ({ page }) => {
        await expect(page.locator(".mx-name-containerWithoutRangeSlider", { timeout: 10000 })).toBeVisible();
        await page.locator(".mx-name-containerWithoutRangeSlider").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-containerWithoutRangeSlider")).toHaveScreenshot(
            `timeSeriesChartWithoutRangeSlider.png`
        );
    });

    test.describe("fill area", () => {
        test("renders time series chart without fill area and compares with a screenshot baseline", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-containerWithoutFillArea", { timeout: 10000 })).toBeVisible();
            await page.locator(".mx-name-containerWithoutFillArea").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerWithoutFillArea")).toHaveScreenshot(
                `timeSeriesChartWithoutFillArea.png`
            );
        });

        test("renders time series chart with custom fill area color and compares with a screenshot baseline", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-containerCustomFillAreaColor", { timeout: 10000 })).toBeVisible();
            await page.locator(".mx-name-containerCustomFillAreaColor").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerCustomFillAreaColor")).toHaveScreenshot(
                `timeSeriesChartCustomFillAreaColor.png`
            );
        });
    });
    test.describe("y axis range", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
            await waitForMendixApp(page);
        });

        test("renders time series chart with non negative values and compares with a screenshot baseline", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-containerYRangeNonNegative", { timeout: 10000 })).toBeVisible();
            await page.locator(".mx-name-containerYRangeNonNegative").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerYRangeNonNegative")).toHaveScreenshot(
                `timeSeriesChartYRangeNonNegative.png`
            );
        });

        test("renders column chart with auto values and compares with a screenshot baseline", async ({ page }) => {
            await expect(page.locator(".mx-name-containerYRangeAuto")).toBeVisible();
            await page.locator(".mx-name-containerYRangeAuto").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerYRangeAuto")).toHaveScreenshot(
                `timeSeriesChartYRangeAuto.png`
            );
        });
    });
});
