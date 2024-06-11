import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("time-series-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("renders time series chart with multiple series and compares with a screenshot baseline", async ({ page }) => {
        await expect(page.locator(".mx-name-containerMultipleSeries", { timeout: 10000 })).toBeVisible();
        await page.locator(".mx-name-containerMultipleSeries").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-containerMultipleSeries")).toHaveScreenshot(
            `timeSeriesChartMultipleSeries.png`,
            { threshold: 0.5 }
        );
    });

    test("renders time series chart without range slider and compares with a screenshot baseline", async ({ page }) => {
        await expect(page.locator(".mx-name-containerWithoutRangeSlider", { timeout: 10000 })).toBeVisible();
        await page.locator(".mx-name-containerWithoutRangeSlider").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-containerWithoutRangeSlider")).toHaveScreenshot(
            `timeSeriesChartWithoutRangeSlider.png`,
            { threshold: 0.5 }
        );
    });

    test.describe("fill area", () => {
        test("renders time series chart without fill area and compares with a screenshot baseline", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-containerWithoutFillArea", { timeout: 10000 })).toBeVisible();
            await page.locator(".mx-name-containerWithoutFillArea").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerWithoutFillArea")).toHaveScreenshot(
                `timeSeriesChartWithoutFillArea.png`,
                { threshold: 0.5 }
            );
        });

        test("renders time series chart with custom fill area color and compares with a screenshot baseline", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-containerCustomFillAreaColor", { timeout: 10000 })).toBeVisible();
            await page.locator(".mx-name-containerCustomFillAreaColor").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerCustomFillAreaColor")).toHaveScreenshot(
                `timeSeriesChartCustomFillAreaColor.png`,
                { threshold: 0.5 }
            );
        });
    });
    test.describe("y axis range", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");
        });

        test("renders time series chart with non negative values and compares with a screenshot baseline", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-containerYRangeNonNegative", { timeout: 10000 })).toBeVisible();
            await page.locator(".mx-name-containerYRangeNonNegative").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerYRangeNonNegative")).toHaveScreenshot(
                `timeSeriesChartYRangeNonNegative.png`,
                { threshold: 0.5 }
            );
        });

        test("renders column chart with auto values and compares with a screenshot baseline", async ({ page }) => {
            await expect(page.locator(".mx-name-containerYRangeAuto")).toBeVisible();
            await page.locator(".mx-name-containerYRangeAuto").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerYRangeAuto")).toHaveScreenshot(
                `timeSeriesChartYRangeAuto.png`,
                {
                    threshold: 0.5
                }
            );
        });
    });
});
