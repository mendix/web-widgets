import { test, expect } from "@playwright/test";

test.describe("datagrid-number-filter-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("visual testing:", () => {
        test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
            page
        }) => {
            const dataGrid = await page.$(".mx-name-datagrid1");
            await expect(dataGrid).toBeVisible();
            await expect(page).toHaveScreenshot(`dataGridNumberFilter-${process.env.BROWSER_NAME}.png`, {
                threshold: 0.1
            });
        });
    });

    test.describe("number filtering", () => {
        test("shows correct result", async ({ page }) => {
            await page.getByRole("textbox", { name: "Filter" }).fill("12", { force: true });
            const cells = await page.$$eval(".mx-name-datagrid1 .td", elements =>
                elements.map(element => element.textContent)
            );
            expect(cells).toEqual(["12test3test3"]);
        });
    });

    test.describe("with Default value", () => {
        test("set init condition (apply filer right after load", async ({ page }) => {
            const NBSP = " ";
            const expected = [`First nameYear${NBSP}`, "Delia1987", "Lizzie1987"];

            await page.goto("/#/filter_init_condition");
            await page.reload();

            const rows = await page.$$(".mx-name-dataGrid21 [role=row]");
            for (let i = 0; i < rows.length; i++) {
                await expect(rows[i]).toHaveText(expected[i]);
            }

            const pagingStatus = await page.textContent(".mx-name-dataGrid21 .paging-status");
            await expect(pagingStatus).toBe("1 to 2 of 2");
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
                    { id: "duplicate-id", reviewOnFail: true }
                ]
            });

            const snapshot = await page.accessibilitySnapshot({ root: ".mx-name-datagrid1" });
            await expect(snapshot).toHaveNoAccessibilityIssuesMatching({ type: "wcag2a" });
        });
    });
});
