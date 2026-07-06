import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@mendix/run-e2e/fixtures";
import { DataGridPage } from "./pages/DataGridPage";

test.describe("datagrid-web selection", async () => {
    test("applies checkbox single selection checkbox", async ({ page }) => {
        const grid = new DataGridPage(page, "dgSingleSelectionCheckbox");

        await grid.open("/p/single-selection");
        await expect(grid.root).toBeVisible();
        await grid.root.locator("input").first().click();
        await expect(page).toHaveScreenshot(`datagridSingleSelectionCheckbox.png`);
    });

    test("applies checkbox single selection row click", async ({ page }) => {
        const grid = new DataGridPage(page, "dgSingleSelectionRowClick");

        await grid.open("/p/single-selection");
        await expect(grid.root).toBeVisible();
        await grid.cells.first().click({ modifiers: ["Shift"] });
        await expect(page).toHaveScreenshot(`datagridSingleSelectionRowClick.png`);
    });

    test("applies checkbox multi selection checkbox", async ({ page }) => {
        const grid = new DataGridPage(page, "dgMultiSelectionCheckbox");

        await grid.open("/p/multi-selection");
        await expect(grid.root).toBeVisible();
        await grid.root.locator("input").first().click();
        await grid.root.locator("input").nth(1).click();
        await expect(page).toHaveScreenshot(`datagridMultiSelectionCheckbox.png`);
    });

    test("applies checkbox multi selection row click", async ({ page }) => {
        const grid = new DataGridPage(page, "dgMultiSelectionRowClick");

        await grid.open("/p/multi-selection");
        await expect(grid.root).toBeVisible();
        await grid.cells.first().click({ force: true });
        await grid.cells.nth(4).click({ modifiers: ["Shift"] });
        await expect(page).toHaveScreenshot(`datagridMultiSelectionRowClick.png`);
    });

    test("checks single selection accessibility with sr-only text", async ({ page }) => {
        const grid = new DataGridPage(page, "dgSingleSelectionCheckbox");
        await grid.open("/p/single-selection");

        await grid.root.waitFor();

        // Verify sr-only text is present in the selection column header
        const srOnlyText = grid.root.locator(".widget-datagrid-col-select .sr-only");
        await expect(srOnlyText).toHaveText(/Select single row/i);

        // Verify sr-only text is not visible but accessible
        await expect(srOnlyText).toBeAttached();
        const isHidden = await srOnlyText.evaluate(el => {
            const style = globalThis.getComputedStyle(el);
            return (
                style.position === "absolute" && (style.width === "1px" || style.clip === "rect(0px, 0px, 0px, 0px)")
            );
        });
        expect(isHidden).toBe(true);

        // Run accessibility scan
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag21aa"])
            .include(".mx-name-dgSingleSelectionCheckbox")
            .exclude(".mx-name-navigationTree3")
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("checks accessibility violations", async ({ page }) => {
        const grid = new DataGridPage(page, "dgMultiSelectionCheckbox");
        await grid.open("/p/multi-selection");

        await grid.root.waitFor();
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag21aa"])
            .include(".mx-name-dgMultiSelectionCheckbox")
            .exclude(".mx-name-navigationTree3")
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
