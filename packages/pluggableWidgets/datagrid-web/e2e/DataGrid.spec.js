import path from "path";
import { test, expect } from "@playwright/test";
import * as XLSX from "xlsx";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("datagrid-web export to Excel", () => {
    test("check if export to Excel generates correct output", async ({ page }) => {
        const downloadedFilename = path.join("./e2e/downloads/", "testFilename.xlsx");

        await page.goto("/p/export-excel");
        await page.waitForLoadState("networkidle");
        await page.locator(".mx-name-dataGridExportExcel").waitFor({ state: "visible", timeout: 15000 });
        // Start waiting for download before clicking.
        const downloadPromise = page.waitForEvent("download");
        await page.locator(".mx-name-exportButton").click({ force: true });
        const download = await downloadPromise;
        // Wait for the download process to complete and save the downloaded file.
        await download.saveAs(downloadedFilename);
        // Read file and convert to JSON.
        const workbook = XLSX.readFile("./e2e/downloads/testFilename.xlsx");
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        expect(jsonData).toHaveLength(50);

        expect(jsonData[0]).toEqual({
            "Birth date": "2/15/1983",
            "Birth year": 1983,
            "Color (enum)": "Black",
            "First name": "Loretta"
        });

        expect(jsonData[1]).toEqual({
            "Birth date": "9/30/1970",
            "Birth year": 1970,
            "Color (enum)": "Red",
            "First name": "Chad"
        });
    });
});

test.describe("capabilities: sorting", () => {
    test("applies the default sort order from the data source option", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1)).toHaveText("First Name");
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1).locator("svg")).toHaveAttribute(
            "data-icon",
            "arrows-alt-v"
        );
        await expect(page.getByRole("gridcell", { name: "12" }).first()).toHaveText("12");
    });

    test("changes order of data to ASC when clicking sort option", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
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
        await expect(page.getByRole("gridcell", { name: "10" }).first()).toHaveText("10");
    });

    test("changes order of data to DESC when clicking sort option", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1)).toHaveText("First Name");
        await page.locator(".mx-name-datagrid1 .column-header").nth(1).click();
        await page.locator(".mx-name-datagrid1 .column-header").nth(1).click();
        await expect(page.locator(".mx-name-datagrid1 .column-header").nth(1).locator("svg")).toHaveAttribute(
            "data-icon",
            "long-arrow-alt-down"
        );
        await expect(page.getByRole("gridcell", { name: "12" }).first()).toHaveText("12");
    });
});

test.describe("capabilities: hiding", () => {
    test("hides a selected column", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-datagrid1 .column-header").first()).toHaveText("Age");
        await page.locator(".mx-name-datagrid1 .column-selector-button").click();
        await page.locator(".column-selectors > li").first().click();
        await expect(page.locator(".mx-name-datagrid1 .column-header").first()).toHaveText("First Name");
    });

    test("hide column saved on configuration attribute capability", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // hide first column
        await page.locator(".mx-name-datagrid5 .column-selector-button").click();
        await page.locator(".column-selectors > li").first().click();

        // check if it is really hidden
        await expect(page.locator(".mx-name-datagrid5 .column-header").first()).toHaveText("Last Name");

        // check config saved to the attribute and visible in the text area
        const textArea = page.locator(".mx-name-textArea1 textarea");
        await expect(textArea).not.toBeEmpty();
        const textAreaValue = await textArea.inputValue();
        expect(JSON.parse(textAreaValue)).toEqual({
            name: "datagrid5",
            schemaVersion: 2,
            settingsHash: "1530160614",
            columns: [
                { columnId: "0", hidden: true },
                { columnId: "1", hidden: false }
            ],
            columnFilters: [],
            groupFilters: [],
            sortOrder: [],
            columnOrder: ["0", "1"]
        });
    });
    test("hide column by default enabled", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-datagrid6 .column-header").first()).toHaveText("First Name");
        await page.locator(".mx-name-datagrid6 .column-selector-button").click();
        await page.locator(".column-selectors > li").first().click();
        await expect(page.locator(".mx-name-datagrid6 .column-header").first()).toHaveText("Id");
    });

    test("do not allow to hide last visible column", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-datagrid1 .column-header").first()).toBeVisible();
        await page.locator(".mx-name-datagrid1 .column-selector-button").click();
        await expect(page.locator(".column-selectors input:checked")).toHaveCount(4);
        await page.locator(".column-selectors > li").nth(3).click();
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
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-datagrid1 .td").first()).toHaveText("12");
        await page.locator(".mx-name-datagrid1 .td").first().click();
        await expect(page.locator(".mx-name-AgeTextBox input")).toHaveValue("12");
    });
});

test.describe("manual column width", () => {
    test("compares with a screenshot baseline and checks the column width is with correct size", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await page.locator(".mx-name-datagrid7").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-datagrid7")).toHaveScreenshot(`dataGridColumnContent.png`);
    });
});

test.describe("visual testing:", () => {
    test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
        page
    }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-datagrid1")).toBeVisible();
        await expect(page.locator(".mx-name-datagrid1")).toHaveScreenshot(`datagrid.png`);
    });
});

test.describe("a11y testing:", () => {
    test("checks accessibility violations", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag21aa"])
            .exclude(".mx-name-navigationTree3")
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
