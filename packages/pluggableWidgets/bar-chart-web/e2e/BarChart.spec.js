import { test, expect } from "@mendix/run-e2e/fixtures";

class BarChart {
    constructor(page, containerName) {
        this.root = page.locator(`.mx-name-${containerName} .widget-chart`);
    }

    get traces() {
        return this.root.locator(".barlayer .trace");
    }

    get bars() {
        return this.root.locator(".barlayer .point path");
    }

    barsOfTrace(index) {
        return this.traces.nth(index).locator(".point path");
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

    // Plotly's drag layer covers the bars and handles hover and click for them.
    async hoverBar(index) {
        await this.bars.nth(index).hover({ force: true });
    }

    async clickBar(index) {
        await this.bars.nth(index).click({ force: true });
    }

    async scrollIntoView() {
        await this.root.scrollIntoViewIfNeeded();
    }
}

test.describe("bar-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("data", () => {
        test("renders a bar per point of a single series", async ({ page }) => {
            const chart = new BarChart(page, "containerSingle");
            await chart.scrollIntoView();

            await expect(chart.traces).toHaveCount(1);
            await expect(chart.bars).toHaveCount(3);
            await expect(chart.legendItems).toHaveText(["North"]);
        });

        test("renders the bars of every static series", async ({ page }) => {
            const chart = new BarChart(page, "containerGroup");
            await chart.scrollIntoView();

            await expect(chart.traces).toHaveCount(2);
            await expect(chart.bars).toHaveCount(6);
            await expect(chart.legendItems).toHaveText(["North", "South"]);
        });

        test("renders a series per group of a multiple series", async ({ page }) => {
            const chart = new BarChart(page, "containerDynamic");
            await chart.scrollIntoView();

            await expect(chart.traces).toHaveCount(2);
            await expect(chart.bars).toHaveCount(6);
            await expect(chart.legendItems).toHaveText(["North", "South"]);
        });

        test("aggregates the values of bars that share a category", async ({ page }) => {
            const chart = new BarChart(page, "containerAggregation");
            await chart.scrollIntoView();

            await expect(chart.bars).toHaveCount(3);
            await chart.hoverBar(0);
            // Apples: North 10 + South 6
            await expect(chart.hoverText).toContainText("16");
        });

        test("renders no bars when the data source is empty", async ({ page }) => {
            const chart = new BarChart(page, "containerEmpty");
            await chart.scrollIntoView();

            await expect(chart.root.locator(".main-svg").first()).toBeVisible();
            await expect(chart.bars).toHaveCount(0);
        });
    });

    test.describe("appearance", () => {
        test("places the bars of each series side by side in group mode", async ({ page }) => {
            const chart = new BarChart(page, "containerGroup");
            await chart.scrollIntoView();
            await expect(chart.bars).toHaveCount(6);

            const north = await chart.barsOfTrace(0).first().boundingBox();
            const south = await chart.barsOfTrace(1).first().boundingBox();
            expect(Math.abs(north.x - south.x)).toBeLessThan(1);
            expect(Math.abs(north.y - south.y)).toBeGreaterThan(north.height - 1);
        });

        test("places the bars of each series end to end in stack mode", async ({ page }) => {
            const chart = new BarChart(page, "containerStack");
            await chart.scrollIntoView();
            await expect(chart.bars).toHaveCount(6);

            const north = await chart.barsOfTrace(0).first().boundingBox();
            const south = await chart.barsOfTrace(1).first().boundingBox();
            expect(Math.abs(north.y - south.y)).toBeLessThan(1);
            expect(Math.abs(north.x + north.width - south.x)).toBeLessThan(1);
        });

        test("applies the bar color", async ({ page }) => {
            const chart = new BarChart(page, "containerColors");
            await chart.scrollIntoView();

            await expect(chart.bars).toHaveCount(3);
            for (const bar of await chart.bars.all()) {
                await expect(bar).toHaveCSS("fill", "rgb(255, 0, 0)");
            }
        });

        test("hides the legend", async ({ page }) => {
            const chart = new BarChart(page, "containerNoLegend");
            await chart.scrollIntoView();

            await expect(chart.traces).toHaveCount(2);
            await expect(chart.legendItems).toHaveCount(0);
        });

        test("shows grid lines in the configured direction", async ({ page }) => {
            const none = new BarChart(page, "containerSingle");
            const horizontal = new BarChart(page, "containerGroup");
            const vertical = new BarChart(page, "containerDynamic");
            const both = new BarChart(page, "containerNoLegend");
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
            const chart = new BarChart(page, "containerCustomLayout");
            await chart.scrollIntoView();

            await expect(chart.root.locator(".gtitle")).toHaveText("Custom layout title");
        });

        test.fixme("shows the axis labels", async ({ page }) => {
            // The chart widgets pass { text } as axis title and the shared layout wraps it again,
            // so Plotly never renders the titles.
            const chart = new BarChart(page, "containerAxisLabels");
            await chart.scrollIntoView();

            await expect(chart.root.locator(".g-xtitle")).toHaveText("Amount");
            await expect(chart.root.locator(".g-ytitle")).toHaveText("Product");
        });
    });

    test.describe("events", () => {
        test("shows the tooltip hover text of a bar", async ({ page }) => {
            const chart = new BarChart(page, "containerSingle");
            await chart.scrollIntoView();

            await chart.hoverBar(1);
            await expect(chart.hoverText).toContainText("Pears: 14");
        });

        test("runs the on click action with the clicked bar", async ({ page }) => {
            const chart = new BarChart(page, "containerClick");
            await chart.scrollIntoView();

            await chart.clickBar(2);
            await expect(page.locator(".mx-name-textClickedPoint")).toHaveText("Clicked North, Plums, amount 12");
        });
    });
});
