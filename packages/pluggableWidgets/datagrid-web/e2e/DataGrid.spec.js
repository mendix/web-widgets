import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@mendix/run-e2e/fixtures";
import path from "path";
import * as XLSX from "xlsx";
import { DataGridPage } from "./pages/DataGridPage";

test.describe("datagrid-web export to Excel", () => {
    test("check if export to Excel generates correct output", async ({ page }) => {
        const downloadedFilename = path.join("./e2e/downloads/", "testFilename.xlsx");

        const grid = new DataGridPage(page, "dataGridExportExcel");
        await grid.open("/p/export-excel");
        await grid.root.waitFor({ state: "visible", timeout: 15000 });
        // Start waiting for download before clicking.
        const downloadPromise = page.waitForEvent("download");
        await page.locator(".mx-name-exportButton").click({ force: true });
        const download = await downloadPromise;
        // Wait for the download process to complete and save the downloaded file.
        await download.saveAs(downloadedFilename);
        // Read file and convert to JSON.
        const workbook = XLSX.readFile("./e2e/downloads/testFilename.xlsx");
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        const formattedData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        expect(rawData).toHaveLength(50);

        // Verify raw cell types — numbers must be t:"n", not t:"s"
        expect(rawData[0]["Birth year"]).toBe(1983);
        expect(typeof rawData[0]["Birth year"]).toBe("number");
        expect(rawData[1]["Birth year"]).toBe(1970);
        expect(typeof rawData[1]["Birth year"]).toBe("number");

        // Verify formatted display values
        expect(formattedData[0]).toEqual({
            "Birth date": "2/15/1983",
            "Birth year": "1983",
            "Color (enum)": "Black",
            "First name": "Loretta"
        });

        expect(formattedData[1]).toEqual({
            "Birth date": "9/30/1970",
            "Birth year": "1970",
            "Color (enum)": "Red",
            "First name": "Chad"
        });
    });
});

test.describe("capabilities: sorting", () => {
    test("applies the default sort order from the data source option", async ({ page }) => {
        const grid = new DataGridPage(page);
        await grid.open("/");
        await expect(grid.columnHeader(1)).toHaveText("First Name");
        await expect(grid.sortIcon(1)).toHaveAttribute("data-icon", "arrows-alt-v");
        await expect(page.getByRole("gridcell", { name: "12" }).first()).toHaveText("12");
    });

    test("changes order of data to ASC when clicking sort option", async ({ page }) => {
        const grid = new DataGridPage(page);
        await grid.open("/");
        await expect(grid.columnHeader(1)).toHaveText("First Name");
        await expect(grid.sortIcon(1)).toHaveAttribute("data-icon", "arrows-alt-v");
        await grid.sortByColumn(1);
        await expect(grid.sortIcon(1)).toHaveAttribute("data-icon", "long-arrow-alt-up");
        await expect(page.getByRole("gridcell", { name: "10" }).first()).toHaveText("10");
    });

    test("changes order of data to DESC when clicking sort option", async ({ page }) => {
        const grid = new DataGridPage(page);
        await grid.open("/");
        await expect(grid.columnHeader(1)).toHaveText("First Name");
        await grid.sortByColumn(1);
        await grid.sortByColumn(1);
        await expect(grid.sortIcon(1)).toHaveAttribute("data-icon", "long-arrow-alt-down");
        await expect(page.getByRole("gridcell", { name: "12" }).first()).toHaveText("12");
    });
});

test.describe("capabilities: hiding", () => {
    test("hides a selected column", async ({ page }) => {
        const grid = new DataGridPage(page);
        await grid.open("/");
        await expect(grid.columnHeaders.first()).toHaveText("Age");
        await grid.openColumnSelector();
        await grid.columnSelectorItems.first().click();
        await expect(grid.columnHeaders.first()).toHaveText("First Name");
    });

    test("hide column saved on configuration attribute capability", async ({ page }) => {
        const grid = new DataGridPage(page, "datagrid5");
        await grid.open("/");

        // hide first column
        await grid.openColumnSelector();
        await grid.columnSelectorItems.first().click();

        // check if it is really hidden
        await expect(grid.columnHeaders.first()).toHaveText("Last Name");

        // check config saved to the attribute and visible in the text area
        const textArea = page.locator(".mx-name-textArea1 textarea");
        await expect(textArea).not.toBeEmpty();
        const textAreaValue = await textArea.inputValue();
        expect(JSON.parse(textAreaValue)).toEqual({
            name: "datagrid5",
            schemaVersion: 3,
            settingsHash: "1530160614",
            columns: [
                { columnId: "0", hidden: true },
                { columnId: "1", hidden: false }
            ],
            columnFilters: [],
            customFilters: [],
            sortOrder: [],
            columnOrder: ["0", "1"]
        });
    });
    test("hide column by default enabled", async ({ page }) => {
        const grid = new DataGridPage(page, "datagrid6");
        await grid.open("/");
        await expect(grid.columnHeaders.first()).toHaveText("First Name");
        await grid.openColumnSelector();
        await grid.columnSelectorItems.first().click();
        await expect(grid.columnHeaders.first()).toHaveText("Id");
    });

    test("do not allow to hide last visible column", async ({ page }) => {
        const grid = new DataGridPage(page);
        await grid.open("/");
        await expect(grid.columnHeaders.first()).toBeVisible();
        await grid.openColumnSelector();
        await expect(grid.checkedColumns).toHaveCount(4);
        await grid.columnSelectorItem(3).click();
        await grid.columnSelectorItem(2).click();
        await grid.columnSelectorItem(1).click();
        await expect(grid.checkedColumns).toHaveCount(1);
        await grid.columnSelectorItem(0).click({ force: true });
        await expect(grid.checkedColumns).toHaveCount(1);
        // Trigger Enter keypress
        await grid.columnSelectorItem(0).press("Enter");
        await expect(grid.checkedColumns).toHaveCount(1);
        // Trigger Space keypress
        await grid.columnSelectorItem(0).press("Space");
        await expect(grid.checkedColumns).toHaveCount(1);
    });
});

test.describe("capabilities: onClick action", () => {
    test("check the context", async ({ page }) => {
        const grid = new DataGridPage(page);
        await grid.open("/");
        await expect(grid.cells.first()).toHaveText("12");
        await grid.cells.first().click();
        await expect(page.locator(".mx-name-AgeTextBox input")).toHaveValue("12");
    });
});

test.describe("manual column width", () => {
    test("compares with a screenshot baseline and checks the column width is with correct size", async ({ page }) => {
        const grid = new DataGridPage(page, "datagrid7");
        await grid.open("/");
        await grid.root.scrollIntoViewIfNeeded();
        await expect(grid.root).toHaveScreenshot(`dataGridColumnContent.png`);
    });
});

test.describe("visual testing:", () => {
    test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
        page
    }) => {
        const grid = new DataGridPage(page);
        await grid.open("/");
        await expect(grid.root).toBeVisible();
        await expect(grid.root).toHaveScreenshot(`datagrid.png`);
    });

    test("compares with a screenshot baseline and checks datagrid using virtual scrolling are rendered as expected", async ({
        page
    }) => {
        const grid = new DataGridPage(page, "dataGrid21");
        await grid.open("/p/virtual-scrolling");
        await expect(grid.root).toBeVisible();
        await grid.root.locator(".mx-name-textFilter1 .filter-selector-content .btn").click();
        await expect(page.locator(".mx-page")).toHaveScreenshot(`datagrid-virtual-scrolling.png`);
    });
});

test.describe("a11y testing:", () => {
    test("checks accessibility violations", async ({ page }) => {
        const grid = new DataGridPage(page);
        await grid.open("/");
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag21aa"])
            .exclude(".mx-name-navigationTree3")
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
