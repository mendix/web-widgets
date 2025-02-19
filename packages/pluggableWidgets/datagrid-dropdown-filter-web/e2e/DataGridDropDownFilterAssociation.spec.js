import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("datagrid-dropdown-filter-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/associations-filter");
        await page.waitForLoadState("networkidle");
    });

    test.describe("single select", () => {
        test("show list of Companies with empty option on top of the list", async ({ page }) => {
            const menu = () => page.locator("text=FMC Corp");

            await page.locator(".mx-name-drop_downFilter2").click();
            await expect(menu()).toBeVisible();
            const list = page.locator(".widget-dropdown-filter-menu-slot > ul > li");
            await expect(list).toHaveCount(21);
            await expect(list.nth(0)).toHaveText("None");
            await expect(list.nth(2)).toHaveText("FMC Corp");
            await expect(list.nth(20)).toHaveText("PETsMART Inc");
        });

        test("set value after option is clicked", async ({ page }) => {
            const select = () => page.getByRole("columnheader", { name: "sort Company" }).getByLabel("Search");
            const toggle = page.locator(".widget-dropdown-filter-toggle");
            const menu = () => page.locator("text=FMC Corp");
            const option1 = () => page.getByRole("option", { name: "Brown-Forman Corporation" });
            const clickOutside = async () => page.locator("body").click();

            await select().click();
            await expect(menu()).toBeVisible();
            await option1().click();
            await expect(toggle.nth(3)).toHaveText("Brown-Forman Corporation");
            await clickOutside();
            await expect(menu()).not.toBeVisible();
            await expect(toggle.nth(3)).toHaveText("Brown-Forman Corporation");
            const rows = page.locator(".mx-name-dataGrid21 .tr");
            await expect(rows).toHaveCount(2);
        });
    });

    test.describe("multiselect", () => {
        test("shows list of Roles", async ({ page }) => {
            const select = () => page.getByRole("columnheader", { name: "Roles" }).getByLabel("Search");
            const menu = () => page.locator("text=Economist");
            const option1 = () => page.getByRole("option", { name: "Economist" });
            const option2 = () => page.getByRole("option", { name: "Public librarian" });
            const option3 = () => page.getByRole("option", { name: "Prison officer" });

            await select().click();
            await expect(menu().first()).toBeVisible();
            await expect(option1()).toBeVisible();
            await expect(option2()).toBeVisible();
            await expect(option3()).toBeVisible();
        });

        test("does filtering when option is checked", async ({ page }) => {
            const select = () => page.getByRole("columnheader", { name: "Roles" }).getByLabel("Search");
            const option2 = () => page.getByRole("option", { name: "Public librarian" });

            await select().click();
            await option2().click();
            const rows = page.locator(".mx-name-dataGrid21 .tr");
            await expect(rows).toHaveCount(5); // 4 rows + 1 header row
        });
    });

    test.describe("keep state of checked options", () => {
        test("open menu with no options selected", async ({ page }) => {
            const select = () => page.locator(".mx-name-drop_downFilter1");
            const menu = () => page.getByRole("option", { name: "Environmental scientist" });
            const clickOutside = async () => (await page.locator("body")).click();

            await select().click();
            const checkedOptions = await menu().locator("input:checked");
            await expect(checkedOptions).toHaveCount(0);
            await clickOutside();
            await expect(menu()).not.toBeVisible();
        });

        test("keep option checked after menu closed", async ({ page }) => {
            const rows = () => page.locator(".mx-name-dataGrid21 [role=row]");
            const select = () => page.locator(".mx-name-drop_downFilter1");
            const menu = () => page.getByRole("option", { name: "Environmental scientist" });
            const option1 = () => page.getByRole("option", { name: "Environmental scientist" });

            await select().click();
            await option1().click();
            const checkedOptions = await menu().locator("input:checked");
            await expect(checkedOptions).toHaveCount(1);
            await expect(checkedOptions.first()).toBeChecked();
            await expect(rows()).toHaveCount(9); // 8 rows + 1 header row
            const checkedOptionsAfterReopen = await menu().locator("input:checked");
            await expect(checkedOptionsAfterReopen).toHaveCount(1);
            await expect(checkedOptionsAfterReopen.first()).toBeChecked();
        });

        test("keep multiple options checked after menu closed", async ({ page }) => {
            const rows = () => page.locator(".mx-name-dataGrid21 [role=row]");
            const select = () => page.locator(".mx-name-drop_downFilter1");
            const menu = () => page.locator(".widget-dropdown-filter-menu-slot > ul > li");
            const option1 = () => page.getByRole("option", { name: "Environmental scientist" });
            const option2 = () => page.getByRole("option", { name: "Trader" });

            await select().click();
            await option1().click();
            await option2().click();
            const checkedOptions = await menu().locator("input:checked");
            await expect(checkedOptions).toHaveCount(2);
            await expect(checkedOptions.first()).toBeChecked();
            await expect(checkedOptions.nth(1)).toBeChecked();
            expect(rows()).toHaveCount(11); // 10 rows + 1 header row
            const checkedOptionsAfterReopen = await menu().locator("input:checked");
            await expect(checkedOptionsAfterReopen).toHaveCount(2);
            await expect(checkedOptionsAfterReopen.first()).toBeChecked();
            await expect(checkedOptionsAfterReopen.nth(1)).toBeChecked();
        });
    });
});
