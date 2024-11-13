import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("datagrid-date-filter-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test.describe("visual testing:", () => {
        test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
            page
        }) => {
            const datagrid = page.locator(".mx-name-datagrid1");
            await expect(datagrid).toBeVisible();
            await expect(datagrid).toHaveScreenshot(`dataGridDateFilter.png`);
        });
    });

    test.fixme(
        "compares with a screenshot baseline and checks if date picker element is rendered as expected",
        async ({ page }) => {
            const datagrid = page.locator(".mx-name-datagrid1");
            const datePickerButton = datagrid.locator(".btn-calendar").first();
            await datePickerButton.click();
            await expect(datagrid).toHaveScreenshot(`dataGridDateFilterDatePicker.png`);
        }
    );

    test("filters a typed date", async ({ page }) => {
        const datagrid = page.locator(".mx-name-datagrid1");
        const filterInput = datagrid.locator(".filter-input");
        await filterInput.fill("10/5/2020", { force: true });
        const tableRows = datagrid.locator(".td");
        await expect(tableRows.first()).toContainText("10/5/2020");
    });

    test("filters between dates", async ({ page }) => {
        const datagrid = page.locator(".mx-name-datagrid1");
        const filterSelector = page.locator(".filter-selector");
        await filterSelector.click();
        const filterSelectorOptions = page.locator(".filter-selectors li");
        await filterSelectorOptions.first().click({ delay: 1 });
        await expect(page.locator(".filter-selector-button")).toHaveAccessibleName("Between");
        const monthSelect = page.locator(".react-datepicker__month-select");
        await monthSelect.selectOption("October");
        const yearSelect = page.locator(".react-datepicker__year-select");
        await yearSelect.selectOption("2020");
        const day4 = page.locator(".react-datepicker__day--004");
        await day4.click();
        const day5 = page.locator(".react-datepicker__day--005");
        await day5.click();
        const layoutGrid = page.locator(".mx-name-layoutGrid1").first();
        await layoutGrid.click();
        const tableRows = datagrid.locator(".td");
        await expect(tableRows.first()).toContainText("10/5/2020");
    });

    test.describe("with Default value", () => {
        test("set initial condition (apply filter right after load)", async ({ page }) => {
            await page.goto("/#/filter_init_condition", { timeout: 1000 });
            await page.reload();
            const row1 = page.locator(".mx-name-dataGrid22 [role=row]").nth(1);
            await expect(row1).toHaveText("Chester2/20/2003");
            const row7 = page.locator(".mx-name-dataGrid22 [role=row]").nth(7);
            await expect(row7).toHaveText("Tyler5/31/2001");
            const rows = page.locator(".mx-name-dataGrid22 [role=row]");
            await expect(rows).toHaveCount(8);
        });
    });

    test.describe("with Default start and Default end dates", () => {
        test("set initial condition (apply filter right after load)", async ({ page }) => {
            await page.goto("/#/filter_init_condition", { timeout: 1000 });
            await page.reload();
            const row1 = page.locator(".mx-name-dataGrid21 [role=row]").nth(1);
            await expect(row1).toHaveText("Jayden4/21/1993");
            const row10 = page.locator(".mx-name-dataGrid21 [role=row]").nth(10);
            await expect(row10).toHaveText("Inez8/13/1992");
            const rows = page.locator(".mx-name-dataGrid21 [role=row]");
            await expect(rows).toHaveCount(11);
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
});
