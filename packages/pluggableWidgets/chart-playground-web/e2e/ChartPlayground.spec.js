import { test, expect } from "@mendix/run-e2e/fixtures";

class Playground {
    constructor(page, containerName) {
        this.root = page.locator(`.mx-name-${containerName}`);
    }

    get chartTitle() {
        return this.root.locator(".gtitle");
    }

    get legendItems() {
        return this.root.locator(".legend .traces .legendtext");
    }

    get sidebar() {
        return this.root.locator(".widget-sidebar");
    }

    get view() {
        return this.sidebar.locator(".sidebar-header-tools select");
    }

    get customSettings() {
        return this.sidebar.locator(".widget-custom-config textarea");
    }

    get jsonError() {
        return this.sidebar.locator(".widget-custom-config").getByRole("alert");
    }

    async open() {
        await this.root.getByRole("button", { name: "Toggle Editor" }).click();
        await expect(this.sidebar).toHaveClass(/widget-sidebar-open/);
    }
}

test.describe("chart-playground-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("with a chart of the charts module", () => {
        test("opens and closes the editor", async ({ page }) => {
            const playground = new Playground(page, "containerArea");
            await expect(playground.sidebar).not.toHaveClass(/widget-sidebar-open/);

            await playground.open();
            // The editor header (and its close button) sits under the Atlas top bar; click beside the editor instead.
            await page.mouse.click(400, 600);

            await expect(playground.sidebar).not.toHaveClass(/widget-sidebar-open/);
        });

        test("offers the layout, every series and the configuration", async ({ page }) => {
            const playground = new Playground(page, "containerArea");

            await playground.open();

            await expect(playground.view.locator("option")).toHaveText(["Layout", "North", "South", "Configuration"]);
            await expect(playground.customSettings).toHaveValue(/"text": "Sales"/);
        });

        test("applies the edited layout to the chart", async ({ page }) => {
            const playground = new Playground(page, "containerArea");
            await expect(playground.chartTitle).toHaveText("Sales");
            await playground.open();

            await playground.customSettings.fill('{ "title": { "text": "Edited in the playground" } }');

            await expect(playground.chartTitle).toHaveText("Edited in the playground");
        });

        test("applies the edited series to the chart", async ({ page }) => {
            const playground = new Playground(page, "containerArea");
            await expect(playground.legendItems).toHaveCount(2);
            await playground.open();

            await playground.view.selectOption({ label: "North" });
            await playground.customSettings.fill('{ "name": "Renamed" }');

            await expect(playground.legendItems).toContainText(["Renamed"]);
            await expect(playground.legendItems).not.toContainText(["North"]);
        });

        test("keeps the chart while the JSON is invalid", async ({ page }) => {
            const playground = new Playground(page, "containerArea");
            await playground.open();

            await playground.customSettings.fill('{ "title": { "text": "Not applied" ');

            await expect(playground.jsonError).toBeVisible();
            await expect(playground.chartTitle).toHaveText("Sales");
        });
    });

    test("applies the edited layout to a custom chart", async ({ page }) => {
        const playground = new Playground(page, "containerCustom");
        await expect(playground.chartTitle).toHaveText("Fruit");
        await playground.open();
        await expect(playground.view.locator("option")).toHaveText(["Layout", "Fruit", "Configuration"]);
        // The custom chart resets the editor from its props once it knows its size; edit after that.
        await expect(playground.customSettings).toHaveValue(/"width": 600/);

        await playground.customSettings.fill('{ "title": { "text": "Edited custom chart" } }');

        await expect(playground.chartTitle).toHaveText("Edited custom chart");
    });
});
