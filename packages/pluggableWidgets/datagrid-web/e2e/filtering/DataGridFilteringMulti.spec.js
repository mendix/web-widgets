import { test, expect } from "@mendix/run-e2e/fixtures";
import { DataGridPage } from "../pages/DataGridPage";

test.describe("datagrid-web filtering multi select", () => {
    /** @type {DataGridPage} */
    let grid;

    test.beforeEach(async ({ page }) => {
        grid = new DataGridPage(page, "dataGrid21");
        await page.goto("/p/filtering-multi");
    });

    test("filter rows where enum attribute equal to one of selected values", async ({ page }) => {
        await expect(grid.rows).toHaveCount(11);
        await expect(grid.columnCells(2).first()).toHaveText("Black");
        await expect(grid.columnCells(2).last()).toHaveText("Blue");
        // drop_downFilter widgets are siblings of the grid, not children — page-scoped selector is required.
        await page.locator('.mx-name-drop_downFilter1[role="combobox"]').click();
        await page.getByRole("option", { name: "Pink", exact: true }).click({ delay: 20 });
        await expect(grid.rows).toHaveCount(6);
        await page.getByRole("option", { name: "Blush", exact: true }).click({ delay: 20 });
        await expect(grid.rows).toHaveCount(8);
        await grid.headerCombobox("Color (enum)").click({ delay: 20 });
        await expect(grid.columnCells(2)).toContainText(["Pink", "Pink", "Pink", "Blush", "Blush", "Pink", "Pink"]);
    });

    test("filter rows where ReferenceSet contains at least one of selected objects", async ({ page }) => {
        const expectedColumnText = [
            "EconomistArmed forces officerTraderHealth service manager",
            "EconomistArmed forces officerTrader",
            "EconomistEditorial assistantArmed forces officer",
            "Public librarianImmunologistWaste disposal officer",
            "Public librarianMaterials specialistWaste disposal officer",
            "EconomistNanoscientist",
            "Economist",
            "Homeless workerEditorial assistantPublic librarian",
            "Environmental scientistPublic librarianMaterials specialist"
        ];
        await expect(grid.columnCells(3).first()).toHaveText(expectedColumnText[0]);
        // drop_downFilter widgets are siblings of the grid, not children — page-scoped selector is required.
        await page.locator('.mx-name-drop_downFilter3[role="combobox"]').click();
        await page.getByRole("option", { name: "Economist", exact: true }).click({ delay: 20 });
        await expect(grid.rows).toHaveCount(6);
        await page.getByRole("option", { name: "Public librarian", exact: true }).click({ delay: 20 });
        await expect(grid.rows).toHaveCount(10);
        await page.locator('.mx-name-drop_downFilter3[role="combobox"]').click({ delay: 20 });
        await expect(grid.columnCells(3)).toHaveText(expectedColumnText);
    });

    test("filter rows where Reference equal to one of selected objects", async ({ page }) => {
        await expect(grid.rows).toHaveCount(11);
        await expect(grid.columnCells(4).first()).toHaveText("W.R. Berkley Corporation");
        await expect(grid.columnCells(4).last()).toHaveText("PETsMART Inc");
        // drop_downFilter widgets are siblings of the grid, not children — page-scoped selector is required.
        await page.locator('.mx-name-drop_downFilter4[role="combobox"]').click({ delay: 20 });
        await page.getByRole("option", { name: "FMC Corp", exact: true }).click({ delay: 20 });
        await expect(grid.rows).toHaveCount(2);
        await page.getByRole("option", { name: "ALLETE, Inc.", exact: true }).click({ delay: 20 });
        await expect(grid.rows).toHaveCount(6);
        await grid.headerCombobox("Company").click({ delay: 20 });
        await expect(grid.columnCells(4)).toContainText([
            "ALLETE, Inc.",
            "FMC Corp",
            "ALLETE, Inc.",
            "ALLETE, Inc.",
            "ALLETE, Inc."
        ]);
    });
});
