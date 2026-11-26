import { test, expect } from "@mendix/run-e2e/fixtures";

class AreaChart {
    constructor(page, containerName) {
        this.root = page.locator(`.mx-name-${containerName} .widget-chart`);
    }

    get traces() {
        return this.root.locator(".scatterlayer .trace");
    }

    get fills() {
        return this.root.locator(".scatterlayer .js-fill");
    }

    get lines() {
        return this.root.locator(".scatterlayer .js-line");
    }

    get markers() {
        return this.root.locator(".scatterlayer .points .point");
    }

    get legendItems() {
        return this.root.locator(".legend .traces .legendtext");
    }

    get verticalGridLines() {
        return this.root.locator(".gridlayer .xgrid");
    }

    get horizontalGridLines() {
        return this.root.locator(".gridlayer .ygrid");
    }

    get hoverText() {
        return this.root.locator(".hoverlayer .hovertext");
    }

    // Plotly's drag layer covers the points and handles hover and click for them.
    async hoverPoint(index) {
        await this.markers.nth(index).hover({ force: true });
    }

    async clickPoint(index) {
        await this.markers.nth(index).click({ force: true });
    }

    async scrollIntoView() {
        await this.root.scrollIntoViewIfNeeded();
    }
}

test.describe("area-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("data", () => {
        test("renders one filled area for a single series", async ({ page }) => {
            const chart = new AreaChart(page, "containerSingle");
            await chart.scrollIntoView();

            await expect(chart.traces).toHaveCount(1);
            await expect(chart.fills).toHaveCount(1);
            await expect(chart.legendItems).toHaveText(["North"]);
        });

        test("renders one filled area per static series", async ({ page }) => {
            const chart = new AreaChart(page, "containerTwoSeries");
            await chart.scrollIntoView();

            await expect(chart.traces).toHaveCount(2);
            await expect(chart.fills).toHaveCount(2);
            // Plotly lists traces filled "tonexty" bottom-up, the same order as the stacked areas.
            await expect(chart.legendItems).toHaveText(["South", "North"]);
        });

        test("renders one area per group of a multiple series", async ({ page }) => {
            const chart = new AreaChart(page, "containerDynamic");
            await chart.scrollIntoView();

            await expect(chart.traces).toHaveCount(2);
            await expect(chart.fills).toHaveCount(2);
            // Plotly lists traces filled "tonexty" bottom-up, the same order as the stacked areas.
            await expect(chart.legendItems).toHaveText(["South", "North"]);
        });

        test("aggregates the y values of points that share an x value", async ({ page }) => {
            const chart = new AreaChart(page, "containerAggregation");
            await chart.scrollIntoView();

            await expect(chart.markers).toHaveCount(6);
            await chart.hoverPoint(0);
            // North 10 + South 6 in month 1
            await expect(chart.hoverText).toContainText("16");
        });

        test("renders no area when the data source is empty", async ({ page }) => {
            const chart = new AreaChart(page, "containerEmpty");
            await chart.scrollIntoView();

            await expect(chart.root.locator(".main-svg").first()).toBeVisible();
            await expect(chart.fills).toHaveCount(0);
            await expect(chart.markers).toHaveCount(0);
        });
    });

    test.describe("appearance", () => {
        test("draws straight lines without markers by default", async ({ page }) => {
            const chart = new AreaChart(page, "containerSingle");
            await chart.scrollIntoView();

            await expect(chart.lines).toHaveCount(1);
            await expect(chart.markers).toHaveCount(0);
            await expect(chart.lines).not.toHaveAttribute("d", /C/);
        });

        test("draws a marker per point and curved lines", async ({ page }) => {
            const chart = new AreaChart(page, "containerMarkers");
            await chart.scrollIntoView();

            await expect(chart.markers).toHaveCount(6);
            await expect(chart.lines).toHaveAttribute("d", /C/);
        });

        test("applies the line, marker and fill colors", async ({ page }) => {
            const chart = new AreaChart(page, "containerColors");
            await chart.scrollIntoView();

            await expect(chart.lines).toHaveCSS("stroke", "rgb(255, 0, 0)");
            await expect(chart.markers.first()).toHaveCSS("fill", "rgb(0, 0, 255)");
            await expect(chart.fills).toHaveCSS("fill", "rgb(0, 128, 0)");
            await expect(chart.fills).toHaveCSS("fill-opacity", "0.5");
        });

        test("hides the legend", async ({ page }) => {
            const chart = new AreaChart(page, "containerNoLegend");
            await chart.scrollIntoView();

            await expect(chart.traces).toHaveCount(2);
            await expect(chart.legendItems).toHaveCount(0);
        });

        test("shows grid lines in the configured direction", async ({ page }) => {
            const none = new AreaChart(page, "containerSingle");
            const horizontal = new AreaChart(page, "containerTwoSeries");
            const vertical = new AreaChart(page, "containerDynamic");
            const both = new AreaChart(page, "containerNoLegend");
            await both.scrollIntoView();

            await expect(none.verticalGridLines).toHaveCount(0);
            await expect(none.horizontalGridLines).toHaveCount(0);
            await expect(horizontal.verticalGridLines).toHaveCount(0);
            await expect(horizontal.horizontalGridLines).not.toHaveCount(0);
            await expect(vertical.verticalGridLines).not.toHaveCount(0);
            await expect(vertical.horizontalGridLines).toHaveCount(0);
            await expect(both.verticalGridLines).not.toHaveCount(0);
            await expect(both.horizontalGridLines).not.toHaveCount(0);
        });

        test("applies the custom layout", async ({ page }) => {
            const chart = new AreaChart(page, "containerCustomLayout");
            await chart.scrollIntoView();

            await expect(chart.root.locator(".gtitle")).toHaveText("Custom layout title");
        });

        test.fixme("shows the axis labels", async ({ page }) => {
            // The chart widgets pass { text } as axis title and the shared layout wraps it again,
            // so Plotly never renders the titles.
            const chart = new AreaChart(page, "containerAxisLabels");
            await chart.scrollIntoView();

            await expect(chart.root.locator(".g-xtitle")).toHaveText("Month");
            await expect(chart.root.locator(".g-ytitle")).toHaveText("Amount");
        });
    });

    test.describe("events", () => {
        test("shows the tooltip hover text of a point", async ({ page }) => {
            const chart = new AreaChart(page, "containerMarkers");
            await chart.scrollIntoView();

            await chart.hoverPoint(2);
            await expect(chart.hoverText).toContainText("Month 3: 12");
        });

        test("runs the on click action with the clicked point", async ({ page }) => {
            const chart = new AreaChart(page, "containerClick");
            await chart.scrollIntoView();

            await chart.clickPoint(3);
            await expect(page.locator(".mx-name-textClickedPoint")).toHaveText("Clicked North, month 4, amount 18");
        });
    });
});
