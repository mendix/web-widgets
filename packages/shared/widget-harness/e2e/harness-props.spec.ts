// Props the datagrid-web test project has no page for, so these run on the harness only.
import { expect, test } from "@playwright/test";

const harness = (fn: string): string => `(${fn})(window.harness)`;

test.beforeEach(async ({ page }) => {
    await page.goto("/?scenario=datagrid-basic");
    await expect(page.locator(".mx-name-datagrid1 .widget-datagrid-grid-body [role=row]")).toHaveCount(10);
});

test("DynamicValue: a new value re-renders the header", async ({ page }) => {
    const header = page.locator(".mx-name-datagrid1 .column-header").first();
    await expect(header).toHaveText("First name");
    await page.evaluate(harness(`h => h.firstNameHeader.set("Given name")`));
    await expect(header).toHaveText("Given name");
});

test("ListExpressionValue: dynamic text is computed per item and follows item changes", async ({ page }) => {
    const firstRow = page.locator(".mx-name-datagrid1 .widget-datagrid-grid-body [role=row]").first();
    await expect(firstRow.getByRole("gridcell", { name: "Loretta Moss" })).toBeVisible();
    await page.evaluate(harness(`h => h.harness.store.update("p01", { lastName: "Lane" })`));
    await expect(firstRow.getByRole("gridcell", { name: "Loretta Lane" })).toBeVisible();
});

test("ListWidgetValue: custom content renders the widget for each item", async ({ page }) => {
    const badges = page.locator(".mx-name-datagrid1 .age-badge");
    await expect(badges).toHaveCount(10);
    await expect(badges.first()).toHaveText("age 20");
    await expect(badges.nth(1)).toHaveText("age 27");
});

test("ActionValue: a selection change executes onSelectionChange", async ({ page }) => {
    await page.getByRole("checkbox", { name: "Select row 2" }).check();
    await expect
        .poll(() => page.evaluate(harness(`h => h.harness.calls.map(c => c.name)`)))
        .toEqual(["onSelectionChange"]);
    const selected = await page.evaluate(harness(`h => h.selection.selection.map(i => i.id)`));
    expect(selected).toEqual(["p02"]);
});
