import { test, expect } from "@playwright/test";

test.describe(
    "time-series-chart-web",
    {
        viewportHeight: 720,
        viewportWidth: 1280
    },
    () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
        });

        test("renders time series chart with multiple series and compares with a screenshot baseline", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-containerMultipleSeries", { timeout: 10000 })).toBeVisible();
            await page.locator(".mx-name-containerMultipleSeries").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerMultipleSeries")).toHaveScreenshot(
                `timeSeriesChartMultipleSeries-`,
                { threshold: 0.5 }
            );
        });

        test("renders time series chart without range slider and compares with a screenshot baseline", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-containerWithoutRangeSlider", { timeout: 10000 })).toBeVisible();
            await page.locator(".mx-name-containerWithoutRangeSlider").scrollIntoViewIfNeeded();
            await expect(page.locator(".mx-name-containerWithoutRangeSlider")).toHaveScreenshot(
                `timeSeriesChartWithoutRangeSlider`,
                { threshold: 0.5 }
            );
        });

        test.describe(
            "fill area",
            {
                viewportHeight: 720,
                viewportWidth: 1280
            },
            () => {
                test("renders time series chart without fill area and compares with a screenshot baseline", async ({
                    page
                }) => {
                    await page.locator(".mx-name-containerWithoutFillArea").scrollIntoViewIfNeeded();
                    await expect(page.locator(".mx-name-containerWithoutFillArea")).toHaveScreenshot(
                        `timeSeriesChartWithoutFillArea`,
                        { threshold: 0.5 }
                    );
                });

                test("renders time series chart with custom fill area color and compares with a screenshot baseline", async ({
                    page
                }) => {
                    await page.locator(".mx-name-containerCustomFillAreaColor").scrollIntoViewIfNeeded();
                    await expect(page.locator(".mx-name-containerCustomFillAreaColor")).toHaveScreenshot(
                        `timeSeriesChartCustomFillAreaColor`,
                        { threshold: 0.5 }
                    );
                });
            }
        );
        test.describe(
            "y axis range",
            {
                viewportHeight: 720,
                viewportWidth: 1280
            },
            () => {
                test.beforeEach(async ({ page }) => {
                    await page.goto("/");
                });

                test("renders time series chart with non negative values and compares with a screenshot baseline", async ({
                    page
                }) => {
                    await expect(page.locator(".mx-name-containerYRangeNonNegative", { timeout: 10000 })).toBeVisible();
                    await page.locator(".mx-name-containerYRangeNonNegative").scrollIntoViewIfNeeded();
                    await expect(page.locator(".mx-name-containerYRangeNonNegative")).toHaveScreenshot(
                        `timeSeriesChartYRangeNonNegative`,
                        { threshold: 0.5 }
                    );
                });

                test("renders column chart with auto values and compares with a screenshot baseline", async ({
                    page
                }) => {
                    await expect(page.locator(".mx-name-containerYRangeAuto")).toBeVisible();
                    await page.locator(".mx-name-containerYRangeAuto").scrollIntoViewIfNeeded();
                    await expect(page.locator(".mx-name-containerYRangeAuto")).toHaveScreenshot(
                        `timeSeriesChartYRangeAuto`,
                        { threshold: 0.5 }
                    );
                });
            }
        );
    }
);
