import { expect, test } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("datagrid-web selection accessibility", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/select-all-a11y");
        await waitForMendixApp(page);
    });

    test("select-all checkbox has aria-label attribute", async ({ page }) => {
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await expect(checkbox).toBeVisible();
    });

    test("select-all checkbox is focusable within grid keyboard navigation", async ({ page }) => {
        const widget = page.locator(".mx-name-dataGrid21");
        const grid = widget.getByRole("grid");
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });

        // Tab into the grid
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press("Tab");
            if (await grid.evaluate(el => el.contains(document.activeElement))) {
                break;
            }
        }

        // Use arrow keys to navigate to select-all checkbox in header
        await page.keyboard.press("ArrowUp");
        await expect(checkbox).toBeFocused();
    });

    test("clicking select-all checkbox selects all rows on page", async ({ page }) => {
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await expect(checkbox).not.toBeChecked();

        await checkbox.click();
        await expect(checkbox).toBeChecked();

        await checkbox.click();
        await expect(checkbox).not.toBeChecked();
    });

    test("row checkboxes have aria-label with row number", async ({ page }) => {
        const row1 = page.getByRole("checkbox", { name: "Select row 1", exact: true });
        const row2 = page.getByRole("checkbox", { name: "Select row 2", exact: true });
        await expect(row1).toBeVisible();
        await expect(row2).toBeVisible();
    });

    test("Select all rows button is reachable via Tab after selecting page", async ({ page }) => {
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await checkbox.click();

        const selectAllButton = page.getByRole("button", { name: /Select all/ });
        await expect(selectAllButton).toBeVisible();

        // Tab until the Select all button receives focus
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press("Tab");
            if (await selectAllButton.evaluate(el => el === document.activeElement)) {
                break;
            }
        }
        await expect(selectAllButton).toBeFocused();
    });

    test("Enter key activates Select all rows button", async ({ page }) => {
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await checkbox.click();

        const selectAllButton = page.getByRole("button", { name: /Select all/ });
        await expect(selectAllButton).toBeVisible();

        // Tab to the Select all button
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press("Tab");
            if (await selectAllButton.evaluate(el => el === document.activeElement)) {
                break;
            }
        }
        await page.keyboard.press("Enter");

        const clearButton = page.getByRole("button", { name: /Clear selection/ }).first();
        await expect(clearButton).toBeVisible();
    });

    test("Clear selection button appears after selecting all rows", async ({ page }) => {
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await checkbox.click();

        const selectAllButton = page.getByRole("button", { name: /Select all/ }).first();
        await selectAllButton.click();

        const clearButton = page.getByRole("button", { name: /Clear selection/ }).first();
        await expect(clearButton).toBeVisible();
    });

    test("Clear selection button clears all selected rows", async ({ page }) => {
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await checkbox.click();

        const selectAllButton = page.getByRole("button", { name: /Select all/ }).first();
        await selectAllButton.click();

        const clearButton = page.getByRole("button", { name: /Clear selection/ }).first();
        await expect(clearButton).toBeVisible();
        await clearButton.click();

        await expect(clearButton).not.toBeVisible();
    });

    test("logical tab order: checkbox -> grid -> SelectAllBar buttons", async ({ page }) => {
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await checkbox.click();

        const selectAllButton = page.getByRole("button", { name: /Select all/ });
        await expect(selectAllButton).toBeVisible();

        const checkboxRect = await checkbox.boundingBox();
        const barRect = await selectAllButton.boundingBox();
        expect(checkboxRect.y).toBeLessThan(barRect.y);
    });

    test("status region announces only bulk operations, not individual checkbox clicks", async ({ page }) => {
        const widget = page.locator(".mx-name-dataGrid21");
        await widget.waitFor();

        const row1 = page.getByRole("checkbox", { name: "Select row 1", exact: true });
        const row2 = page.getByRole("checkbox", { name: "Select row 2", exact: true });
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });

        // Individual checkbox clicks should NOT announce to avoid redundancy with native "checked" announcement
        await row1.click();
        await expect(widget.locator('[role="status"]')).toHaveCount(0);

        await row2.click();
        await expect(widget.locator('[role="status"]')).toHaveCount(0);

        // Select all (bulk operation) SHOULD announce
        await checkbox.click();
        await expect(widget).toMatchAriaSnapshot(`
            - status: "5 rows selected"
        `);

        // Clear selection (bulk operation) SHOULD announce
        const clearButton = widget.locator(".widget-datagrid-footer").getByRole("button", { name: /Clear selection/ });
        await clearButton.click();
        await expect(widget.locator('[role="status"]')).toHaveCount(0);
    });

    test("visual selection counter has no aria-live to avoid double announcements", async ({ page }) => {
        const widget = page.locator(".mx-name-dataGrid21");
        await widget.waitFor();

        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await checkbox.click();

        // The visual counter must not be a live region to avoid redundancy
        await expect(widget.locator(".widget-datagrid-selection-text[aria-live]")).toHaveCount(0);

        // The status region only appears for bulk operations (not individual clicks)
        const statusWithText = widget.locator('[role="status"]').filter({ hasText: /rows selected/ });
        await expect(statusWithText).toHaveCount(1);
    });

    // "Clear selection" button exists in both the top bar (inside grid) and footer;
    // this test targets the top bar button only.
    test("Select all button retains focus and changes label to Clear selection", async ({ page }) => {
        const widget = page.locator(".mx-name-dataGrid21");
        const grid = widget.getByRole("grid");
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await checkbox.click();

        const selectAllButton = grid.getByRole("button", { name: /Select all/ });
        await expect(selectAllButton).toHaveAttribute("aria-live", "assertive");
        await selectAllButton.click();

        const clearButton = grid.getByRole("button", { name: /Clear selection/ });
        await expect(clearButton).toBeVisible();
        await expect(clearButton).toBeFocused();
    });

    // When "Clear selection" hides the bar, focus should return to the select-all
    // checkbox (the trigger that caused the bar to appear) per WAI-ARIA APG guidance.
    test("Clear selection returns focus to select-all checkbox", async ({ page }) => {
        const widget = page.locator(".mx-name-dataGrid21");
        const grid = widget.getByRole("grid");
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await checkbox.click();

        const selectAllButton = grid.getByRole("button", { name: /Select all/ });
        await selectAllButton.click();

        const clearButton = grid.getByRole("button", { name: /Clear selection/ });
        await expect(clearButton).toBeVisible();
        await clearButton.click();

        await expect(checkbox).toBeFocused();
    });

    // Second grid (mx-name-dataGrid22) uses row-click selection without checkboxes.
    // Focus should return to the grid's active cell after clearing.
    test("No-checkbox grid: clear selection returns focus to active cell", async ({ page }) => {
        const widget2 = page.locator(".mx-name-dataGrid22");
        const grid2 = widget2.locator("[role='grid']");
        await expect(grid2).toBeVisible();

        const firstRow = grid2.locator("[role='row']").nth(1);
        await firstRow.click();

        const clearButton = widget2.getByRole("button", { name: /Clear selection/ });
        await expect(clearButton).toBeVisible();
        await clearButton.click();

        const activeCell = grid2.locator("[role='gridcell'][tabindex='0'], [role='columnheader'][tabindex='0']");
        await expect(activeCell.first()).toBeFocused();
    });

    test("No-checkbox grid: clear after multi-select returns focus to active cell", async ({ page }) => {
        const widget2 = page.locator(".mx-name-dataGrid22");
        const grid2 = widget2.locator("[role='grid']");
        await expect(grid2).toBeVisible();

        // Select multiple rows via Ctrl+Click
        const row1 = grid2.locator("[role='row']").nth(1);
        const row2 = grid2.locator("[role='row']").nth(2);
        await row1.click();
        await row2.click({ modifiers: ["ControlOrMeta"] });

        const clearButton = widget2.getByRole("button", { name: /Clear selection/ });
        await expect(clearButton).toBeVisible();
        await clearButton.click();

        const activeCell = grid2.locator("[role='gridcell'][tabindex='0'], [role='columnheader'][tabindex='0']");
        await expect(activeCell.first()).toBeFocused();
    });

    test("No-checkbox grid: focus does not fall to body after clear", async ({ page }) => {
        const widget2 = page.locator(".mx-name-dataGrid22");
        const grid2 = widget2.locator("[role='grid']");
        await expect(grid2).toBeVisible();

        const firstRow = grid2.locator("[role='row']").nth(1);
        await firstRow.click();

        const clearButton = widget2.getByRole("button", { name: /Clear selection/ });
        await expect(clearButton).toBeVisible();
        await clearButton.click();

        await expect(page.locator("body")).not.toBeFocused();
    });

    test("No-checkbox grid: select all pages then clear returns focus to active cell", async ({ page }) => {
        const widget2 = page.locator(".mx-name-dataGrid22");
        const grid2 = widget2.locator("[role='grid']");
        await expect(grid2).toBeVisible();

        // Wait for data rows to load
        const rows = grid2.locator("[role='row']");
        await expect(rows).not.toHaveCount(1);

        // Select all rows on the page by clicking each one
        const rowCount = await rows.count();
        for (let i = 1; i < rowCount; i++) {
            await rows.nth(i).click();
        }

        // Select-all bar should appear
        const selectAllBar = widget2.locator(".widget-datagrid-select-all-bar");
        await expect(selectAllBar).toBeVisible();

        // Click "Select all" to select across all pages (async operation)
        const selectAllButton = selectAllBar.getByRole("button", { name: /Select all/ });
        await selectAllButton.click();

        // Wait for async select-all to complete — button label changes to "Clear selection"
        const clearButton = selectAllBar.getByRole("button", { name: /Clear selection/ });
        await expect(clearButton).toBeVisible({ timeout: 15000 });
        await clearButton.click();

        const activeCell = grid2.locator("[role='gridcell'][tabindex='0'], [role='columnheader'][tabindex='0']");
        await expect(activeCell.first()).toBeFocused();
    });

    test("No-checkbox grid: Ctrl+A selects all rows and shows select-all bar", async ({ page }) => {
        const widget2 = page.locator(".mx-name-dataGrid22");
        const grid2 = widget2.locator("[role='grid']");
        await expect(grid2).toBeVisible();

        // Click a row to focus the grid
        const firstRow = grid2.locator("[role='row']").nth(1);
        await firstRow.click();

        // Ctrl+A to select all page rows
        await page.keyboard.press("ControlOrMeta+a");

        // Select-all bar should appear with "Select all" button
        const selectAllBar = widget2.locator(".widget-datagrid-select-all-bar");
        await expect(selectAllBar).toBeVisible();
        const selectAllButton = selectAllBar.getByRole("button", { name: /Select all/ });
        await expect(selectAllButton).toBeVisible();

        // Click "Select all" to select across all pages (async operation)
        await selectAllButton.click();

        // Wait for async operation — button label changes to "Clear selection"
        const clearButton = selectAllBar.getByRole("button", { name: /Clear selection/ });
        await expect(clearButton).toBeVisible({ timeout: 15000 });
        await clearButton.click();

        const activeCell = grid2.locator("[role='gridcell'][tabindex='0'], [role='columnheader'][tabindex='0']");
        await expect(activeCell.first()).toBeFocused();
    });

    // The footer also has a "Clear selection" button; focus should return to the
    // select-all checkbox when it clears selection and disappears.
    test("Footer clear selection returns focus to select-all checkbox", async ({ page }) => {
        const checkbox = page.getByRole("checkbox", { name: "Select all rows" });
        await checkbox.click();

        const widget = page.locator(".mx-name-dataGrid21");
        const clearButton = widget.locator(".widget-datagrid-footer").getByRole("button", { name: /Clear selection/ });
        await expect(clearButton).toBeVisible();
        await clearButton.click();

        await expect(checkbox).toBeFocused();
    });
});
