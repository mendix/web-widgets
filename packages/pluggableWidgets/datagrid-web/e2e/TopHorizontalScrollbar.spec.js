import { expect, test } from "@mendix/run-e2e/fixtures";

test.describe("optional top horizontal scrollbar", () => {
    test("does not add a scrollbar to existing grids by default", async ({ page }) => {
        await page.goto("/");
        const grid = page.locator(".mx-name-datagrid1");
        await expect(grid.getByRole("grid")).toBeVisible();
        await expect(grid.locator(".widget-datagrid-top-scrollbar")).toHaveCount(0);
    });
});
