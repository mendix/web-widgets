import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("datagrid-text-filter-web", () => {
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
            await expect(page).toHaveScreenshot(`dataGridTextFilter.png`, {
                threshold: 0.1
            });
        });
    });

    test.describe("text filtering", () => {
        test("shows correct result", async ({ page }) => {
            await page.locator(".mx-name-datagrid1 input").fill("test3", { force: true });
            const rows = page.locator(".mx-name-datagrid1 .tr");
            await expect(rows).toHaveCount(2);
            const cells = await page.$$eval(".mx-name-datagrid1 .td", elements =>
                elements.map(element => element.textContent)
            );
            await expect(cells).toEqual(["12", "test3", "test3", ""]);
        });

        test("check the context", async ({ page }) => {
            await page.locator(".mx-name-datagrid1 input").fill("test3", { force: true });
            const firstCell = await page.locator(".mx-name-datagrid1 .td");
            await expect(firstCell.first()).toHaveText("12");
            await firstCell.first().click();
            const ageTextBox = await page.locator(".mx-name-AgeTextBox input");
            await expect(ageTextBox).toHaveValue("12");
        });
    });

    test.describe("with Default value", () => {
        test("set init condition (apply filer right after load", async ({ page }) => {
            const NBSP = " ";
            const expected = [`First name${NBSP}`, "Betty"];

            await page.goto("/p/filter_init_condition");
            await page.waitForLoadState("networkidle");

            const rows = await page.locator(".mx-name-dataGrid21 [role=row]");
            for (let i = 0; i < rows.length; i++) {
                await expect(rows[i]).toHaveText(expected[i]);
            }

            const pagingStatus = await page.textContent(".mx-name-dataGrid21 .paging-status");
            await expect(pagingStatus).toBe("1 to 1 of 1");
        });
    });

    test.describe("a11y testing:", () => {
        test("checks accessibility violations", async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");

            const accessibilityScanResults = await new AxeBuilder({ page })
                .withTags(["wcag21aa"])
                .disableRules([
                    "aria-required-children",
                    "label",
                    "aria-roles",
                    "button-name",
                    "duplicate-id-active",
                    "duplicate-id",
                    "aria-allowed-attr",
                    "image-alt"
                ])
                .exclude(".mx-name-navigationTree3")
                .analyze();

            expect(accessibilityScanResults.violations).toEqual([]);
        });
    });
});
