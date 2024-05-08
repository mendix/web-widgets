import { test, expect } from "@playwright/test";

test.describe("line-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("line style", () => {
        test("renders basic line chart and compares with a screenshot baseline", async ({ page }) => {
            const basicLineChartElement = await page.$(".mx-name-containerBasic");
            await expect(basicLineChartElement).toBeVisible({ timeout: 10000 });
            await expect(basicLineChartElement).toHaveScreenshot(`lineChartLineBasic.png`);
        });

        test("renders line with markers and compares with a screenshot baseline", async ({ page }) => {
            const lineChartWithMarkersElement = await page.$(".mx-name-containerMarkers", { timeout: 10000 });
            await expect(lineChartWithMarkersElement).toBeVisible();
            await lineChartWithMarkersElement.scrollIntoViewIfNeeded();
            await expect(lineChartWithMarkersElement).toHaveScreenshot(`lineChartLineMarkers.png`);
        });

        test("renders colored line with colored markers and compares with a screenshot baseline", async ({ page }) => {
            const coloredLineChartElement = await page.$(".mx-name-containerColoredMarkerLine");
            await coloredLineChartElement.scrollIntoViewIfNeeded();
            await expect(coloredLineChartElement).toHaveScreenshot(`lineChartColoredLineMarkers.png`);
        });
    });

    test.describe("interpolation", () => {
        test("renders linear and compares with a screenshot baseline", async ({ page }) => {
            const linearLineChartElement = await page.$(".mx-name-containerLinear");
            await linearLineChartElement.scrollIntoViewIfNeeded();
            await expect(linearLineChartElement).toHaveScreenshot(`lineChartLinear.png`);
        });

        test("renders curved and compares with a screenshot baseline", async ({ page }) => {
            const curvedLineChartElement = await page.$(".mx-name-containerCurved");
            await curvedLineChartElement.scrollIntoViewIfNeeded();
            await expect(curvedLineChartElement).toHaveScreenshot(`lineChartCurved.png`);
        });
    });

    test.describe("grid lines", () => {
        test("renders horizontal grid lines and compares with a screenshot baseline", async ({ page }) => {
            const verticalGridLinesElement = await page.$(".mx-name-containerVertical");
            await verticalGridLinesElement.scrollIntoViewIfNeeded();
            await verticalGridLinesElement.toHaveScreenshot(`lineChartGridLinesVertical.png`);
        });

        test("renders vertical grid lines and compares with a screenshot baseline", async ({ page }) => {
            const horizontalGridLinesElement = await page.$(".mx-name-containerHorizontal");
            await horizontalGridLinesElement.scrollIntoViewIfNeeded();
            await horizontalGridLinesElement.toHaveScreenshot(`lineChartGridLinesHorizontal.png`);
        });

        test("renders both grid lines and compares with a screenshot baseline", async ({ page }) => {
            const bothGridLinesElement = await page.$(".mx-name-containerBoth");
            await bothGridLinesElement.scrollIntoViewIfNeeded();
            await bothGridLinesElement.toHaveScreenshot(`lineChartGridLinesBoth.png`);
        });
    });

    test.describe("legend", () => {
        test("renders with legend and compares with a screenshot baseline", async page => {
            await page.goto("/");
            const legendElement = await page.$(".mx-name-containerLegend");
            await legendElement.scrollIntoView();
            await expect(legendElement).toHaveScreenshot(`lineChartLegend.png`);
        });

        test("renders without legend and compares with a screenshot baseline", async ({ page }) => {
            await page.goto("/");
            const noLegendElement = await page.$(".mx-name-containerNoLegend");
            await noLegendElement.scrollIntoView();
            await expect(noLegendElement).toHaveScreenshot(`lineChartNoLegend.png`);
        });
    });

    test.describe("axis label", () => {
        test("renders x axis label and compares with a screenshot baseline", async ({ page }) => {
            await page.goto("/");
            const xLabelElement = await page.$(".mx-name-containerXLabel");
            await xLabelElement.scrollIntoView();
            await expect(xLabelElement).toHaveScreenshot(`lineChartXLabel.png`);
        });

        test("renders y axis label legend and compares with a screenshot baseline", async ({ page }) => {
            await page.goto("/");
            const yLabelElement = await page.$(".mx-name-containerYLabel");
            await yLabelElement.scrollIntoView();
            await yLabelElement.toHaveScreenshot(`lineChartYLabel.png`);
        });

        test("renders x+y axis label legend and compares with a screenshot baseline", async ({ page }) => {
            await page.goto("/");
            const xyLabelsElement = await page.$(".mx-name-containerXYLabels");
            await xyLabelsElement.scrollIntoView();
            await xyLabelsElement.toHaveScreenshot(`lineChartXYLabels.png`);
        });
    });
    test.describe("dimensions", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
        });

        test("renders with width: pixels (500px) height: pixels (300px) and compares with a screenshot baseline", async ({
            page
        }) => {
            const dimensionPixelsElement = await page.$(".mx-name-containerDimensionPixels");
            await dimensionPixelsElement.scrollIntoView();
            await dimensionPixelsElement.toHaveScreenshot(`lineChartDimensionPixels.png`);
        });

        test("renders with width: pixels (500px) height: percentage of width (50%) and compares with a screenshot baseline", async ({
            page
        }) => {
            const percentageOfWidthElement = await page.$(".mx-name-containerPercentageOfWidth");
            await percentageOfWidthElement.scrollIntoView();
            await percentageOfWidthElement.toHaveScreenshot(`lineChartDimensionPercentageOfWidth.png`);
        });

        test("renders with width: pixels (500px) height: percentage of parent (50%) and compares with a screenshot baseline", async ({
            page
        }) => {
            const pixelsPercentageOfParentElement = await page.$(".mx-name-containerPixelsPercentageOfParent");
            await pixelsPercentageOfParentElement.scrollIntoView();
            await pixelsPercentageOfParentElement.toHaveScreenshot(`lineChartDimensionPixelsPercentageOfParent.png`);
        });

        test("renders with width: percentage (80%) height: pixels (300px) and compares with a screenshot baseline", async ({
            page
        }) => {
            const percentagePixelsElement = await page.$(".mx-name-containerPercentagePixels");
            await percentagePixelsElement.scrollIntoView();
            await percentagePixelsElement.toHaveScreenshot(`lineChartDimensionPercentagePixels.png`);
        });

        test("renders with width: percentage (100%) height: percentage of parent (50%) and compares with a screenshot baseline", async ({
            page
        }) => {
            const percentageOfParentElement = await page.$(".mx-name-containerPercentageOfParent");
            await percentageOfParentElement.scrollIntoView();
            await percentageOfParentElement.toHaveScreenshot(`lineChartDimensionPercentageOfParent.png`);
        });

        test("renders with width: percentage (100%) height: percentage of width (75%) and compares with a screenshot baseline", async ({
            page
        }) => {
            const dimensionPercentageElement = await page.$(".mx-name-containerDimensionPercentage");
            await dimensionPercentageElement.scrollIntoView();
            await dimensionPercentageElement.toHaveScreenshot(`lineChartDimensionPercentage.png`);
        });
    });
});
