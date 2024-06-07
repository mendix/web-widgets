import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("line-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test.describe("line style", () => {
        test("renders basic line chart and compares with a screenshot baseline", async ({ page }) => {
            const basicLineChartElement = await page.locator(".mx-name-containerBasic");
            await expect(basicLineChartElement).toBeVisible();
            await expect(
                page.locator(".mx-name-containerBasic > .widget-chart > .mx-react-plotly-chart")
            ).toBeVisible();
            await expect(basicLineChartElement).toHaveScreenshot(`lineChartLineBasic.png`);
        });

        test("renders line with markers and compares with a screenshot baseline", async ({ page }) => {
            const lineChartWithMarkersElement = await page.locator(".mx-name-containerMarkers");
            await lineChartWithMarkersElement.scrollIntoViewIfNeeded();
            await expect(lineChartWithMarkersElement).toBeVisible();
            await expect(
                page.locator(".mx-name-containerMarkers > .widget-chart > .mx-react-plotly-chart")
            ).toBeVisible();
            await expect(lineChartWithMarkersElement).toHaveScreenshot(`lineChartLineMarkers.png`);
        });

        test("renders colored line with colored markers and compares with a screenshot baseline", async ({ page }) => {
            const coloredLineChartElement = await page.locator(".mx-name-containerColoredMarkerLine");
            await coloredLineChartElement.scrollIntoViewIfNeeded();
            await expect(coloredLineChartElement).toBeVisible();
            await expect(coloredLineChartElement).toHaveScreenshot(`lineChartColoredLineMarkers.png`);
        });
    });

    test.describe("interpolation", async () => {
        test("renders linear and compares with a screenshot baseline", async ({ page }) => {
            const linearLineChartElement = await page.locator(".mx-name-containerLinear");
            await linearLineChartElement.scrollIntoViewIfNeeded();
            await expect(linearLineChartElement).toBeVisible();
            await expect(linearLineChartElement).toHaveScreenshot(`lineChartLinear.png`);
        });

        test("renders curved and compares with a screenshot baseline", async ({ page }) => {
            const curvedLineChartElement = await page.locator(".mx-name-containerCurved");
            await curvedLineChartElement.scrollIntoViewIfNeeded();
            await expect(curvedLineChartElement).toBeVisible();
            await expect(
                page.locator(".mx-name-containerCurved > .widget-chart > .mx-react-plotly-chart")
            ).toBeVisible();
            await expect(curvedLineChartElement).toHaveScreenshot(`lineChartCurved.png`);
        });
    });

    test.describe("grid lines", () => {
        test("renders horizontal grid lines and compares with a screenshot baseline", async ({ page }) => {
            const verticalGridLinesElement = await page.locator(".mx-name-containerVertical");
            await verticalGridLinesElement.scrollIntoViewIfNeeded();
            await expect(verticalGridLinesElement).toBeVisible();
            await expect(verticalGridLinesElement).toHaveScreenshot(`lineChartGridLinesVertical.png`);
        });

        test("renders vertical grid lines and compares with a screenshot baseline", async ({ page }) => {
            const horizontalGridLinesElement = await page.locator(".mx-name-containerHorizontal");
            await horizontalGridLinesElement.scrollIntoViewIfNeeded();
            await expect(horizontalGridLinesElement).toBeVisible();
            await expect(horizontalGridLinesElement).toHaveScreenshot(`lineChartGridLinesHorizontal.png`);
        });

        test("renders both grid lines and compares with a screenshot baseline", async ({ page }) => {
            const bothGridLinesElement = await page.locator(".mx-name-containerBoth");
            await bothGridLinesElement.scrollIntoViewIfNeeded();
            await expect(bothGridLinesElement).toBeVisible();
            await expect(bothGridLinesElement).toHaveScreenshot(`lineChartGridLinesBoth.png`);
        });
    });

    test.describe("legend", () => {
        test("renders with legend and compares with a screenshot baseline", async ({ page }) => {
            const legendElement = await page.locator(".mx-name-containerLegend");
            await legendElement.scrollIntoViewIfNeeded();
            await expect(legendElement).toBeVisible();
            await expect(legendElement).toHaveScreenshot(`lineChartLegend.png`);
        });

        test("renders without legend and compares with a screenshot baseline", async ({ page }) => {
            const noLegendElement = await page.locator(".mx-name-containerNoLegend");
            await noLegendElement.scrollIntoViewIfNeeded();
            await expect(noLegendElement).toBeVisible();
            await expect(noLegendElement).toHaveScreenshot(`lineChartNoLegend.png`);
        });
    });

    test.describe("axis label", () => {
        test("renders x axis label and compares with a screenshot baseline", async ({ page }) => {
            const xLabelElement = await page.locator(".mx-name-containerXLabel");
            await xLabelElement.scrollIntoViewIfNeeded();
            await expect(xLabelElement).toBeVisible();
            await expect(
                page.locator(".mx-name-containerXLabel > .widget-chart > .mx-react-plotly-chart")
            ).toBeVisible();
            await expect(xLabelElement).toHaveScreenshot(`lineChartXLabel.png`);
        });

        test("renders y axis label legend and compares with a screenshot baseline", async ({ page }) => {
            const yLabelElement = await page.locator(".mx-name-containerYLabel");
            await yLabelElement.scrollIntoViewIfNeeded();
            await expect(yLabelElement).toBeVisible();
            await expect(
                page.locator(".mx-name-containerYLabel > .widget-chart > .mx-react-plotly-chart")
            ).toBeVisible();
            await expect(yLabelElement).toHaveScreenshot(`lineChartYLabel.png`);
        });

        test("renders x+y axis label legend and compares with a screenshot baseline", async ({ page }) => {
            const xyLabelsElement = await page.locator(".mx-name-containerXYLabels");
            await xyLabelsElement.scrollIntoViewIfNeeded();
            await expect(xyLabelsElement).toBeVisible();
            await expect(
                page.locator(".mx-name-containerXYLabels > .widget-chart > .mx-react-plotly-chart")
            ).toBeVisible();
            await expect(xyLabelsElement).toHaveScreenshot(`lineChartXYLabels.png`);
        });
    });
    test.describe("dimensions", () => {
        test("renders with width: pixels (500px) height: pixels (300px) and compares with a screenshot baseline", async ({
            page
        }) => {
            const dimensionPixelsElement = await page.locator(".mx-name-containerDimensionPixels");
            await dimensionPixelsElement.scrollIntoViewIfNeeded();
            await expect(dimensionPixelsElement).toBeVisible();
            await expect(dimensionPixelsElement).toHaveScreenshot(`lineChartDimensionPixels.png`);
        });

        test("renders with width: pixels (500px) height: percentage of width (50%) and compares with a screenshot baseline", async ({
            page
        }) => {
            const percentageOfWidthElement = await page.locator(".mx-name-containerPercentageOfWidth");
            await percentageOfWidthElement.scrollIntoViewIfNeeded();
            await expect(percentageOfWidthElement).toBeVisible();
            await expect(
                page.locator(".mx-name-containerPercentageOfWidth > .widget-chart > .mx-react-plotly-chart")
            ).toBeVisible();
            await expect(percentageOfWidthElement).toHaveScreenshot(`lineChartDimensionPercentageOfWidth.png`);
        });

        test("renders with width: pixels (500px) height: percentage of parent (50%) and compares with a screenshot baseline", async ({
            page
        }) => {
            const pixelsPercentageOfParentElement = await page.locator(".mx-name-containerPixelsPercentageOfParent");
            await pixelsPercentageOfParentElement.scrollIntoViewIfNeeded();
            await expect(pixelsPercentageOfParentElement).toBeVisible();
            await expect(pixelsPercentageOfParentElement).toHaveScreenshot(
                `lineChartDimensionPixelsPercentageOfParent.png`
            );
        });

        test("renders with width: percentage (80%) height: pixels (300px) and compares with a screenshot baseline", async ({
            page
        }) => {
            const percentagePixelsElement = await page.locator(".mx-name-containerPercentagePixels");
            await percentagePixelsElement.scrollIntoViewIfNeeded();
            await expect(percentagePixelsElement).toBeVisible();
            await expect(percentagePixelsElement).toHaveScreenshot(`lineChartDimensionPercentagePixels.png`);
        });

        test("renders with width: percentage (100%) height: percentage of parent (50%) and compares with a screenshot baseline", async ({
            page
        }) => {
            const percentageOfParentElement = await page.locator(".mx-name-containerPercentageOfParent");
            await percentageOfParentElement.scrollIntoViewIfNeeded();
            await expect(percentageOfParentElement).toBeVisible();
            await expect(percentageOfParentElement).toHaveScreenshot(`lineChartDimensionPercentageOfParent.png`);
        });

        test("renders with width: percentage (100%) height: percentage of width (75%) and compares with a screenshot baseline", async ({
            page
        }) => {
            const dimensionPercentageElement = await page.locator(".mx-name-containerDimensionPercentage");
            await dimensionPercentageElement.scrollIntoViewIfNeeded();
            await expect(dimensionPercentageElement).toBeVisible();
            await expect(
                page.locator(".mx-name-containerDimensionPercentage > .widget-chart > .mx-react-plotly-chart")
            ).toBeVisible();
            await expect(dimensionPercentageElement).toHaveScreenshot(`lineChartDimensionPercentage.png`);
        });
    });
});
