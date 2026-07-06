import { expect, test } from "@mendix/run-e2e/fixtures";
import { DataGridPage } from "../pages/DataGridPage";

test.describe("datagrid-web filtering empty strings", () => {
    /** @type {DataGridPage} */
    let grid;

    test.beforeEach(async ({ page }) => {
        grid = new DataGridPage(page, "dataGrid2_1");
        await grid.open("/p/filtering-empty-string");
    });

    test("filter rows by Empty and Not empty", async () => {
        // all 3 records are shown
        await expect(grid.columnCells(1)).toHaveText(["User 1 (with value)", 'User 3 ("")', "User 3 (empty)"]);

        // select Empty option
        await grid.headerFilterButton(2).click({ delay: 20 });
        await grid.headerFilterOption(2, "Empty").click({ delay: 20 });

        // both, `empty` and `""` records are visible. Record with text is filtered out.
        await expect(grid.columnCells(1)).toHaveText(['User 3 ("")', "User 3 (empty)"]);

        // select "Not empty" option
        await grid.headerFilterButton(2).click({ delay: 20 });
        await grid.headerFilterOption(2, "Not empty").click({ delay: 20 });

        // Record with text is visible, `empty` and `""` records are filtered out.
        await expect(grid.columnCells(1)).toHaveText(["User 1 (with value)"]);
    });
});
