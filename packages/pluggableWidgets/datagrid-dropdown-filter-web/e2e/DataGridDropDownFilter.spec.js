import { test, expect } from "@playwright/test";

test.describe("datagrid-dropdown-filter-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("visual testing:", () => {
        test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
            page
        }) => {
            const dataGrid = await page.$(".mx-name-datagrid1");
            await expect(dataGrid).toBeVisible();
            await expect(page).toHaveScreenshot(`dataGridDropDownFilter-${process.env.BROWSER_NAME}.png`, {
                threshold: 0.1
            });
        });
    });

    test.describe("using enumeration as attribute", () => {
        test("shows the expected result", async ({ page }) => {
            await page.click(".mx-name-datagrid1 .dropdown-container:first-child");
            await page.click(".dropdown-list > li:nth-child(1)");
            const cells = await page.$$eval(".mx-name-datagrid1 .td", elements =>
                elements.map(element => element.textContent)
            );
            expect(cells).toEqual(["10testtestYes"]);
        });

        test("shows the expected result with multiple selected items", async ({ page }) => {
            await page.click(".mx-name-datagrid1 .dropdown-container:first-child");
            await page.click(".dropdown-list > li:nth-child(1)");
            await page.click(".dropdown-list > li:nth-child(2)");
            const cells = await page.$$eval(".mx-name-datagrid1 .td", elements =>
                elements.map(element => element.textContent)
            );
            expect(cells).toEqual(["10testtestYes", "20test2test2Yes"]);
        });
    });

    test.describe("using boolean as attribute", () => {
        test("shows the expected result", async ({ page }) => {
            await page.click(".mx-name-datagrid1 .dropdown-container:last-child");
            const dropdownItem = await page.$(".dropdown-list > li:nth-child(3)");
            await expect(dropdownItem).toHaveText("No");
            await dropdownItem.click();
            const cells = await page.$$(".mx-name-datagrid1 .td");
            expect(cells.length).toBe(0);
        });
    });

    test.describe("with Default value", () => {
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

            await page.goto("/#/filter_init_condition");
            await page.reload();

            const rows = await page.$$(".mx-name-dataGrid21 [role=row]");
            for (let i = 0; i < rows.length; i++) {
                await expect(rows[i]).toHaveText(expected[i]);
            }

            const pagingStatus = await page.textContent(".mx-name-dataGrid21 .paging-status");
            await expect(pagingStatus).toBe("1 to 10 of 27");
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

            await page.goto("/#/filter_init_condition");
            await page.reload();

            const rows = await page.$$(".mx-name-dataGrid22 [role=row]");
            for (let i = 0; i < rows.length; i++) {
                await expect(rows[i]).toHaveText(expected[i]);
            }

            const pagingStatus = await page.textContent(".mx-name-dataGrid22 .paging-status");
            await expect(pagingStatus).toBe("1 to 5 of 5");
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

            await page.goto("/#/filter_init_condition");
            await page.reload();

            const rows = await page.$$(".mx-name-dataGrid23 [role=row]");
            for (let i = 0; i < rows.length; i++) {
                await expect(rows[i]).toHaveText(expected[i]);
            }

            const pagingStatus = await page.textContent(".mx-name-dataGrid23 .paging-status");
            await expect(pagingStatus).toBe("1 to 10 of 27");
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

            await page.goto("/#/filter_init_condition");
            await page.reload();

            const rows = await page.$$(".mx-name-dataGrid24 [role=row]");
            for (let i = 0; i < rows.length; i++) {
                await expect(rows[i]).toHaveText(expected[i]);
            }

            const pagingStatus = await page.textContent(".mx-name-dataGrid24 .paging-status");
            await expect(pagingStatus).toBe("1 to 5 of 5");
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

            await page.goto("/#/filter_init_condition");
            await page.reload();

            const rows = await page.$$(".mx-name-dataGrid25 [role=row]");
            for (let i = 0; i < rows.length; i++) {
                await expect(rows[i]).toHaveText(expected[i]);
            }

            const pagingStatus = await page.textContent(".mx-name-dataGrid25 .paging-status");
            await expect(pagingStatus).toBe("1 to 10 of 19");
        });
    });

    test.describe("a11y testing:", () => {
        test("checks accessibility violations", async ({ page }) => {
            await page.goto("/");
            await page.initializeAccessibility();
            await page.setAccessibilityOptions({
                rules: [
                    { id: "aria-required-children", reviewOnFail: true },
                    { id: "label", reviewOnFail: true },
                    { id: "aria-roles", reviewOnFail: true },
                    { id: "button-name", reviewOnFail: true },
                    { id: "duplicate-id-active", reviewOnFail: true },
                    { id: "aria-allowed-attr", reviewOnFail: true }
                ]
            });

            const snapshot = await page.accessibilitySnapshot({ root: ".mx-name-datagrid1" });
            await expect(snapshot).toHaveNoAccessibilityIssuesMatching({ type: "wcag2a" });
        });
    });
});
