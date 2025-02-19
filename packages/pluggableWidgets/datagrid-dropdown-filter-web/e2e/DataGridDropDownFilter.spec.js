import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("datagrid-dropdown-filter-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test.describe("visual testing:", () => {
        test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
            page
        }) => {
            const dataGrid = await page.locator(".mx-name-datagrid1");
            await expect(dataGrid).toBeVisible();
            await expect(page).toHaveScreenshot(`dataGridDropDownFilter-${process.env.BROWSER_NAME}.png`, {
                threshold: 0.1
            });
        });
    });

    test.describe("using enumeration as attribute", () => {
        test("shows the expected result", async ({ page }) => {
            await page.click(".mx-name-datagrid1 .mx-name-dataGridDrop_downFilter1");
            await page.click(".widget-dropdown-filter-menu-slot > ul > li:nth-child(2)");
            await page.click("#DataGrid4-column0");
            await page.waitForLoadState("networkidle");
            const cells = await page.$$eval(".mx-name-datagrid1 .td", elements =>
                elements.map(element => element.textContent)
            );
            expect(cells).toEqual(["10", "test", "test", "Yes", ""]);
        });

        test("shows the expected result with multiple selected items", async ({ page }) => {
            await page.click(".mx-name-datagrid1 .mx-name-dataGridDrop_downFilter1");
            await page.click(".widget-dropdown-filter-menu-slot > ul > li:nth-child(2)");
            await page.click(".widget-dropdown-filter-menu-slot > ul > li:nth-child(3)");
            await page.click("#DataGrid4-column0");
            await page.waitForLoadState("networkidle");
            const cells = await page.$$eval(".mx-name-datagrid1 .td", elements =>
                elements.map(element => element.textContent)
            );
            expect(cells).toEqual(["10", "test", "test", "Yes", "", "20", "test2", "test2", "Yes", ""]);
        });
    });

    test.describe("using boolean as attribute", () => {
        test("shows the expected result", async ({ page }) => {
            await page.getByRole("combobox", { name: "Empty" }).click();
            const dropdownItem = await page.locator(".widget-dropdown-filter-menu-slot > ul > li:nth-child(3)");
            await expect(dropdownItem).toHaveText("No");
            await dropdownItem.click();
            await page.locator("#DataGrid4-column1").click();
            const cells = await page.locator(".mx-name-datagrid1 .tr");
            expect(cells).toHaveCount(1);
        });

        test("shows no results when no items selected", async ({ page }) => {
            await page.getByRole("combobox", { name: "Empty" }).click();
            const dropdownItem = await page.locator(".widget-dropdown-filter-menu-slot > ul > li:nth-child(1)"); //the first item means none selected
            await dropdownItem.click();
            await page.locator("#DataGrid4-column1").click();
            const cells = await page.locator(".mx-name-datagrid1 .tr");
            expect(cells).toHaveCount(4);
        });
    });
});

test.describe("with Default value", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/filter_init_condition");
        await page.waitForLoadState("networkidle");
    });

    test("in single mode, set init condition for boolean", async ({ page }) => {
        const expected = [
            "First namePets (boolean)",
            "LorettaYes",
            "ChadYes",
            "JosieYes",
            "ChesterYes",
            "CoreyYes",
            "BryanYes",
            "DonYes",
            "FloydYes",
            "CeceliaYes",
            "OpheliaYes"
        ];

        const rows = page.locator(".mx-name-dataGrid21 [role=row]");
        for (let i = 0; i < rows.length; i++) {
            await expect(rows[i]).toHaveText(expected[i]);
        }

        const pagingStatus = page.locator(".mx-name-dataGrid21").getByText("to 10 of 27").nth(1);
        await expect(pagingStatus).toHaveText("1 to 10 of 27");
    });

    test("in single mode, set init condition for enum", async ({ page }) => {
        const expected = [
            "First nameColor (enum)",
            "ChesterCyan",
            "DeliaCyan",
            "LizzieCyan",
            "DeanCyan",
            "MitchellCyan"
        ];

        const rows = page.locator(".mx-name-dataGrid22 [role=row]");
        for (let i = 0; i < rows.length; i++) {
            await expect(rows[i]).toHaveText(expected[i]);
        }

        const pagingStatus = page.locator(".mx-name-dataGrid22").getByText("to 5 of 5").nth(1);
        await expect(pagingStatus).toHaveText("1 to 5 of 5");
    });

    test("in multi mode, set init condition for boolean", async ({ page }) => {
        const expected = [
            "First namePets (boolean)",
            "LorettaYes",
            "ChadYes",
            "JosieYes",
            "ChesterYes",
            "CoreyYes",
            "BryanYes",
            "DonYes",
            "FloydYes",
            "CeceliaYes",
            "OpheliaYes"
        ];

        const rows = page.locator(".mx-name-dataGrid23 [role=row]");
        for (let i = 0; i < rows.length; i++) {
            await expect(rows[i]).toHaveText(expected[i]);
        }

        const pagingStatus = page.locator(".mx-name-dataGrid23").getByText("to 10 of 27").nth(1);
        await expect(pagingStatus).toHaveText("1 to 10 of 27");
    });

    test("in multi mode, set init condition for enum", async ({ page }) => {
        const expected = [
            "First nameColor (enum)",
            "ChesterCyan",
            "DeliaCyan",
            "LizzieCyan",
            "DeanCyan",
            "MitchellCyan"
        ];

        const rows = page.locator(".mx-name-dataGrid24 [role=row]");
        for (let i = 0; i < rows.length; i++) {
            await expect(rows[i]).toHaveText(expected[i]);
        }

        const pagingStatus = page.locator(".mx-name-dataGrid24").getByText("to 5 of 5").nth(1);
        await expect(pagingStatus).toHaveText("1 to 5 of 5");
    });

    test("in multi mode, with multiple default values, set init condition for enum", async ({ page }) => {
        const expected = [
            "First nameColor (enum)",
            "ChadRed",
            "JosieRed",
            "ChesterCyan",
            "DeliaCyan",
            "CoreyBlue",
            "BryanBlue",
            "LuellaBlue",
            "LizzieCyan",
            "DollieRed",
            "HesterRed"
        ];

        const rows = page.locator(".mx-name-dataGrid25 [role=row]");
        for (let i = 0; i < rows.length; i++) {
            await expect(rows[i]).toHaveText(expected[i]);
        }

        const pagingStatus = page.locator(".mx-name-dataGrid25").getByText("to 10 of 19").nth(1);
        await expect(pagingStatus).toHaveText("1 to 10 of 19");
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
