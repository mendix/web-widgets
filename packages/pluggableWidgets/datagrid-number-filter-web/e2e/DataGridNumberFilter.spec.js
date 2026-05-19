import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";
import AxeBuilder from "@axe-core/playwright";

test.describe("datagrid-number-filter-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
    });

    test.describe("visual testing:", () => {
        test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
            page
        }) => {
            const dataGrid = await page.locator(".mx-name-datagrid1");
            await expect(dataGrid).toBeVisible();
            await expect(page).toHaveScreenshot(`dataGridNumberFilter.png`);
        });
    });

    test.describe("number filtering", () => {
        test("shows correct result", async ({ page }) => {
            await page.locator(".mx-name-datagrid1 input").fill("12");
            const rows = page.locator(".mx-name-datagrid1 .tr");
            await expect(rows).toHaveCount(2);
            const cells = await page.$$eval(".mx-name-datagrid1 .td", elements =>
                elements.map(element => element.textContent)
            );
            await expect(cells).toEqual(["12", "test3", "test3", ""]);
        });
    });

    test.describe("with Default value", () => {
        test("set init condition (apply filer right after load", async ({ page }) => {
            const NBSP = " ";
            const expected = [`First nameYear${NBSP}`, "Delia1987", "Lizzie1987"];

            await page.goto("/p/filter_init_condition");
            await waitForMendixApp(page);

            const pagingStatus = page.locator(".mx-name-dataGrid21 .paging-status");
            await expect(pagingStatus).toHaveText("1 to 2 of 2");

            const rows = page.locator(".mx-name-dataGrid21 [role=row]");
            await expect(rows).toHaveCount(expected.length);
            for (let i = 0; i < expected.length; i++) {
                await expect(rows.nth(i)).toHaveText(expected[i]);
            }
        });
    });

    test.describe("a11y testing:", () => {
        test("checks accessibility violations", async ({ page }) => {
            await page.goto("/");
            await waitForMendixApp(page);

            const accessibilityScanResults = await new AxeBuilder({ page })
                .withTags(["wcag21aa"])
                .exclude(".mx-name-navigationTree3")
                .analyze();

            expect(accessibilityScanResults.violations).toEqual([]);
        });
    });
});
