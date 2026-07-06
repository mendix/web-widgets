import { test, expect } from "@mendix/run-e2e/fixtures";
import { DataGridPage } from "../pages/DataGridPage";

test.describe("datagrid-web filtering multi select", () => {
    /** @type {DataGridPage} */
    let grid;

    test.beforeEach(async ({ page }) => {
        grid = new DataGridPage(page, "dataGrid21");
        await grid.open("/p/filtering-multi");
    });

    test("filter rows where enum attribute equal to one of selected values", async ({ page }) => {
        await expect(grid.rows).toHaveCount(11);
        await expect(grid.columnCells(2).first()).toHaveText("Black");
        await expect(grid.columnCells(2).last()).toHaveText("Blue");
        await grid.dropdownFilter(1).click();
        await grid.option("Pink").click({ delay: 20 });
        await expect(grid.rows).toHaveCount(6);
        await grid.option("Blush").click({ delay: 20 });
        await expect(grid.rows).toHaveCount(8);
        await page.getByRole("columnheader", { name: "Color (enum)" }).getByRole("combobox").click({ delay: 20 });
        await expect(grid.columnCells(2)).toContainText(["Pink", "Pink", "Pink", "Blush", "Blush", "Pink", "Pink"]);
    });

    test("filter rows where ReferenceSet contains at least one of selected objects", async () => {
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
        await grid.dropdownFilter(3).click();
        await grid.option("Economist").click({ delay: 20 });
        await expect(grid.rows).toHaveCount(6);
        await grid.option("Public librarian").click({ delay: 20 });
        await expect(grid.rows).toHaveCount(10);
        await grid.dropdownFilter(3).click({ delay: 20 });
        await expect(grid.columnCells(3)).toHaveText(expectedColumnText);
    });

    test("filter rows where Reference equal to one of selected objects", async ({ page }) => {
        await expect(grid.rows).toHaveCount(11);
        await expect(grid.columnCells(4).first()).toHaveText("W.R. Berkley Corporation");
        await expect(grid.columnCells(4).last()).toHaveText("PETsMART Inc");
        await grid.dropdownFilter(4).click({ delay: 20 });
        await grid.option("FMC Corp").click({ delay: 20 });
        await expect(grid.rows).toHaveCount(2);
        await grid.option("ALLETE, Inc.").click({ delay: 20 });
        await expect(grid.rows).toHaveCount(6);
        await page.getByRole("columnheader", { name: "Company" }).getByRole("combobox").click({ delay: 20 });
        await expect(grid.columnCells(4)).toContainText([
            "ALLETE, Inc.",
            "FMC Corp",
            "ALLETE, Inc.",
            "ALLETE, Inc.",
            "ALLETE, Inc."
        ]);
    });
});
