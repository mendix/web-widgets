import { test, expect } from "@mendix/run-e2e/fixtures";

class CustomChart {
    constructor(page, containerName) {
        this.root = page.locator(`.mx-name-${containerName} .widget-custom-chart`);
    }

    get bars() {
        return this.root.locator(".barlayer .point path");
    }

    get markers() {
        return this.root.locator(".scatterlayer .points .point");
    }

    get title() {
        return this.root.locator(".gtitle");
    }

    get modeBar() {
        return this.root.locator(".modebar");
    }

    get plot() {
        return this.root.locator(".main-svg").first();
    }

    // Plotly's drag layer covers the bars and handles the click for them.
    async clickBar(index) {
        await this.bars.nth(index).click({ force: true });
    }

    async scrollIntoView() {
        await this.root.scrollIntoViewIfNeeded();
    }
}

test.describe("custom-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("data", () => {
        test("renders the static data and layout", async ({ page }) => {
            const chart = new CustomChart(page, "containerStatic");
            await chart.scrollIntoView();

            await expect(chart.bars).toHaveCount(3);
            await expect(chart.title).toHaveText("Static title");
        });

        test("merges the data of the source attribute into the static data", async ({ page }) => {
            const chart = new CustomChart(page, "containerAttribute");
            await chart.scrollIntoView();

            await expect(chart.bars).toHaveCount(3);
            for (const bar of await chart.bars.all()) {
                await expect(bar).toHaveCSS("fill", "rgb(255, 0, 0)");
            }
        });

        test("updates when the source attribute changes", async ({ page }) => {
            const chart = new CustomChart(page, "containerAttribute");
            const dataInput = page.locator(".mx-name-textAreaData textarea");

            await dataInput.fill('[{"x": ["A", "B", "C", "D"], "y": [4, 5, 6, 7]}]');
            await dataInput.blur();
            await chart.scrollIntoView();

            await expect(chart.bars).toHaveCount(4);
        });

        test("uses the sample data when the source attribute is empty", async ({ page }) => {
            const chart = new CustomChart(page, "containerSample");
            await chart.scrollIntoView();

            await expect(chart.markers).toHaveCount(2);
        });

        test("merges the layout of the source attribute over the static layout", async ({ page }) => {
            const chart = new CustomChart(page, "containerLayoutAttribute");
            await chart.scrollIntoView();

            await expect(chart.title).toHaveText("Attribute title");
        });
    });

    test.describe("configuration", () => {
        test("hides the mode bar by default", async ({ page }) => {
            const chart = new CustomChart(page, "containerStatic");
            await chart.scrollIntoView();

            await expect(chart.bars).toHaveCount(3);
            await expect(chart.modeBar).toHaveCount(0);
        });

        test("applies the configuration options", async ({ page }) => {
            const chart = new CustomChart(page, "containerConfig");
            await chart.scrollIntoView();

            await expect(chart.modeBar).toHaveCount(1);
        });

        test("renders at the configured size", async ({ page }) => {
            const chart = new CustomChart(page, "containerSize");
            await chart.scrollIntoView();

            await expect(chart.plot).toHaveAttribute("width", "500");
            await expect(chart.plot).toHaveAttribute("height", "300");
        });
    });

    test.describe("events", () => {
        test("stores the clicked point and runs the on click action", async ({ page }) => {
            const chart = new CustomChart(page, "containerClick");
            await chart.scrollIntoView();
            await expect(chart.bars).toHaveCount(3);

            await chart.clickBar(1);

            const eventData = page.locator(".mx-name-textEventData");
            await expect(eventData).toBeVisible();
            const clicked = JSON.parse(await eventData.textContent());
            expect(clicked).toMatchObject({ curveNumber: 0, pointIndex: 1, x: "B", y: 2 });
        });
    });
});
