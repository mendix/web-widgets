import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("bubble-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
    });

    test.describe("bubble color", () => {
        test(
            "renders bubble chart with default color and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerDefaultColor .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartDefaultColor.png");
            },
            { retry: 3 }
        );

        test(
            "renders bubble chart with custom color and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerCustomColor .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartCustomColor.png");
            },
            { retry: 3 }
        );
    });

    test.describe("bubble size", () => {
        test(
            "renders bubble chart with auto scale and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerAutoScale .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartAutoScale.png");
            },
            { retry: 3 }
        );

        test(
            "renders bubble chart with manual scale factor and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerManualScale .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartManualScale.png");
            },
            { retry: 3 }
        );
    });

    test.describe("data series", () => {
        test(
            "renders bubble chart with single series and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerSingleSeries .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartSingleSeries.png");
            },
            { retry: 3 }
        );

        test(
            "renders bubble chart with multiple series and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerMultipleSeries .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartMultipleSeries.png");
            },
            { retry: 3 }
        );
    });

    test.describe("legend", () => {
        test(
            "renders bubble chart with legend and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerLegend .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartLegend.png");
            },
            { retry: 3 }
        );

        test(
            "renders bubble chart without legend and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerNoLegend .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartNoLegend.png");
            },
            { retry: 3 }
        );
    });

    test.describe("axis label", () => {
        test(
            "renders bubble chart with x axis label and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerXLabel .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartXLabel.png");
            },
            { retry: 3 }
        );

        test(
            "renders bubble chart with y axis label and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerYLabel .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartYLabel.png");
            },
            { retry: 3 }
        );

        test(
            "renders bubble chart with x and y axis labels and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerXYLabels .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartXYLabels.png");
            },
            { retry: 3 }
        );
    });

    test.describe("grid lines", () => {
        test(
            "renders bubble chart with horizontal grid lines and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerGridHorizontal .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartGridHorizontal.png");
            },
            { retry: 3 }
        );

        test(
            "renders bubble chart with vertical grid lines and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerGridVertical .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartGridVertical.png");
            },
            { retry: 3 }
        );

        test(
            "renders bubble chart with both grid lines and compares with a screenshot baseline",
            async ({ page }) => {
                const container = page.locator(".mx-name-containerGridBoth .widget-chart");
                await container.scrollIntoViewIfNeeded();
                await expect(container).toBeVisible({ timeout: 10000 });
                await expect(container.locator(".plot-container")).toBeVisible();
                await expect(container).toHaveScreenshot("bubbleChartGridBoth.png");
            },
            { retry: 3 }
        );
    });
});
