import path from "path";
import { test, expect } from "@playwright/test";

test.describe("datagrid-web export to Excel", async ({ page }) => {
    test.fixme("check if export to Excel generates correct output", async () => {
        const downloadedFilename = path.join(downloadsFolder, "testFilename.xlsx");

        await page.goto("/p/export-excel");
        await page.locator(".mx-name-dataGridExportExcel").waitFor({ state: "visible", timeout: 15000 });
        await page.locator(".mx-name-exportButton").click({ force: true });

        console.log("**Confirm downloaded file**");
        const buffer = await page.waitForFile(downloadedFilename, { timeout: 15000 });
        expect(buffer.length).toBeGreaterThan(100);

        console.log("**The file exists**");
        //TODO: find one way to read the Excel file
        const excelData = await page.readExcelFile(downloadedFilename);
        expect(excelData).toHaveLength(51);

        expect(excelData[0]).toEqual(["First name", "Birth date", "Birth year", "Color (enum)", "Roles (ref set)"]);

        expect(excelData[1]).toEqual(["Loretta", "2/15/1983", "1983", "Black", "n/a (custom content)"]);
    });
});

test.describe("capabilities: sorting", () => {
    test("applies the default sort order from the data source option", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1)).toHaveText("First Name");
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1).locator("svg")).toHaveAttribute(
            "data-icon",
            "arrows-alt-v"
        );
        await expect(page.locator(".mx-name-datagrid1 .td")).toHaveText("12test3test311test2test210testtest");
    });

    test("changes order of data to ASC when clicking sort option", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1)).toHaveText("First Name");
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1).locator("svg")).toHaveAttribute(
            "data-icon",
            "arrows-alt-v"
        );
        await page.locator(".mx-name-datagrid1 .column-header").nth(1).click();
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1).locator("svg")).toHaveAttribute(
            "data-icon",
            "long-arrow-alt-up"
        );
        await expect(page.locator(".mx-name-datagrid1 .td")).toHaveText("10testtest11test2test212test3test3");
    });

    test("changes order of data to DESC when clicking sort option", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1)).toHaveText("First Name");
        await page.locator(".mx-name-datagrid1 .column-header").nth(1).click();
        await page.locator(".mx-name-datagrid1 .column-header").nth(1).click();
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1).locator("svg")).toHaveAttribute(
            "data-icon",
            "long-arrow-alt-down"
        );
        await expect(page.locator(".mx-name-datagrid1 .td")).toHaveText("12test3test311test2test210testtest");
    });
});

test.describe("capabilities: hiding", () => {
    test("hides a selected column", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(".mx-name-datagrid1 .column-header")).first().toHaveText("Age");
        await page.locator(".mx-name-datagrid1 .column-selector-button").click();
        await page.locator(".column-selectors > li").first().click();
        await expect(page.locator(".mx-name-datagrid1 .column-header")).first().toHaveText("First Name");
    });

    test("hide column saved on configuration attribute capability", async ({ page }) => {
        await page.goto("/");
        await page.locator(".mx-name-datagrid5 .column-selector-button").click();
        await page.locator(".column-selectors > li").first().click();
        await expect(page.locator(".mx-name-datagrid5 .column-header")).first().toHaveText("Last Name");
        const textArea = await page.locator(".mx-name-textArea1 textarea");
        const textAreaValue = await textArea.inputValue();
        expect(JSON.parse(textAreaValue)).toEqual({
            schemaVersion: 1,
            settingsHash: "1530160614",
            name: "datagrid5",
            sortOrder: [],
            columnOrder: ["0", "1"],
            columns: [
                { columnId: "0", hidden: true },
                { columnId: "1", hidden: false }
            ]
        });
    });
    test("hide column by default enabled", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(".mx-name-datagrid6 .column-header")).first().toHaveText("First Name");
        await page.locator(".mx-name-datagrid6 .column-selector-button").click();
        await page.locator(".column-selectors > li").first().click();
        await expect(page.locator(".mx-name-datagrid6 .column-header")).first().toHaveText("Id");
    });

    test("do not allow to hide last visible column", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(".mx-name-datagrid1 .column-header")).first().toBeVisible();
        await page.locator(".mx-name-datagrid1 .column-selector-button").click();
        await expect(page.locator(".column-selectors input:checked")).toHaveCount(3);
        await page.locator(".column-selectors > li").nth(2).click();
        await page.locator(".column-selectors > li").nth(1).click();
        await expect(page.locator(".column-selectors input:checked")).toHaveCount(1);
        await page.locator(".column-selectors > li").nth(0).click();
        await expect(page.locator(".column-selectors input:checked")).toHaveCount(1);
        // Trigger Enter keypress
        await page.locator(".column-selectors > li").nth(0).press("Enter");
        await expect(page.locator(".column-selectors input:checked")).toHaveCount(1);
        // Trigger Space keypress
        await page.locator(".column-selectors > li").nth(0).press("Space");
        await expect(page.locator(".column-selectors input:checked")).toHaveCount(1);
    });
});

test.describe("capabilities: onClick action", () => {
    test("check the context", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(".mx-name-datagrid1 .td")).first().toHaveText("12");
        await page.locator(".mx-name-datagrid1 .td").first().click();
        await expect(page.locator(".mx-name-AgeTextBox input")).toHaveValue("12");
    });
});

test.describe("manual column width", () => {
    test("compares with a screenshot baseline and checks the column width is with correct size", async ({ page }) => {
        await page.goto("/");
        await page.locator(".mx-name-datagrid7").scrollIntoView();
        await expect(page.locator(".mx-name-datagrid7")).toHaveScreenshot(`dataGridColumnContent.png`);
    });
});

test.describe("visual testing:", () => {
    test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
        page
    }) => {
        await page.goto("/");
        await expect(page.locator(".mx-name-datagrid1")).toBeVisible();
        await expect(page.locator(".mx-name-datagrid1")).toHaveScreenshot(`datagrid.png`);
    });
});

test.describe("a11y testing:", () => {
    test("checks accessibility violations", async ({ page }) => {
        await page.goto("/");
        await page.initializeAccessibility();
        await page.setAccessibilityScannerOptions({
            //TODO: Skipped some rules as we still need to review them
            rules: [
                { id: "aria-required-children", reviewOnFail: true },
                { id: "label", reviewOnFail: true }
            ]
        });
        // Test the widget at initial load
        const snapshot = await page.accessibilitySnapshot({ root: ".mx-name-datagrid1" });
        expect(snapshot).toMatchSnapshot("datagrid-accessibility.txt", { threshold: 0.1 });
    });
});
