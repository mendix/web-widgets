import { expect, test } from "@mendix/run-e2e/fixtures";
import { DataGridPage } from "../pages/DataGridPage";

test.describe("datagrid-web filtering single select", () => {
    /** @type {DataGridPage} */
    let grid;

    test.beforeEach(async ({ page }) => {
        grid = new DataGridPage(page, "dataGrid21");
        await grid.open("/p/filtering-single");
    });

    test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
        page
    }) => {
        await expect(grid.root).toBeVisible();

        await expect(page).toHaveScreenshot(`datagridFilteringSingle.png`);
    });

    test("filter rows that have Yes in Pets column", async () => {
        await grid.dropdownFilter(2).click();
        await grid.option("Yes").click({ delay: 1 });
        await expect(grid.columnCells(3)).toHaveText([
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes"
        ]);
    });

    test("filter rows that have No in Pets column", async () => {
        await grid.dropdownFilter(2).click();
        await grid.option("No").click();
        await expect(grid.columnCells(3).first()).toHaveText("No");
        const columnTexts = await grid.columnCells(3).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("No"));
    });

    test("reset filter state when empty option is clicked", async ({ page }) => {
        await grid.dropdownFilter(2).click();
        await grid.option("Yes").click({ delay: 20 });
        await expect(grid.rows).toHaveCount(11);
        await expect(grid.columnCells(3)).toHaveText([
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes",
            "Yes"
        ]);
        await grid.dropdownFilter(2).click({ delay: 20 });
        await page.getByRole("row", { name: "Pets (bool)" }).getByRole("option").first().click();
        await expect(grid.columnCells(3)).toHaveText([
            "Yes",
            "Yes",
            "Yes",
            "No",
            "Yes",
            "No",
            "No",
            "Yes",
            "No",
            "Yes"
        ]);
    });

    test("filter rows that have Cyan in Color column", async () => {
        await grid.dropdownFilter(1).click();
        await grid.option("Cyan").click({ delay: 1 });
        await expect(grid.rows).toHaveCount(6);
        const columnTexts = await grid.columnCells(2).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("Cyan"));
    });

    test("filter rows that have Black in Color column", async () => {
        await grid.dropdownFilter(1).click();
        await grid.option("Black").click({ delay: 1 });
        await expect(grid.rows).toHaveCount(9);
        const columnTexts = await grid.columnCells(2).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("Black"));
    });

    test("filter rows that match selected role", async () => {
        await expect(grid.rows).toHaveCount(11);
        await grid.dropdownFilter(3).click();
        await grid.option("Trader").click({ delay: 1 });
        await expect(grid.rows).toHaveCount(8);
        const columnTexts = await grid.columnCells(4).allTextContents();
        columnTexts.forEach(text => expect(text).toContain("Trader"));
    });

    test("filter rows that match selected company", async () => {
        await expect(grid.rows).toHaveCount(11);
        await grid.dropdownFilter(4).click();
        await grid.option("PETsMART Inc").click({ delay: 1 });
        await expect(grid.rows).toHaveCount(9);
        const columnTexts = await grid.columnCells(5).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("PETsMART Inc"));
    });
});
