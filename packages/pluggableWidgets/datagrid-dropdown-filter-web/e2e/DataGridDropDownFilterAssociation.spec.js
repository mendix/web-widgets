import { test, expect } from "@playwright/test";

test.describe("datagrid-dropdown-filter-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/associations-filter");
        await page.waitForLoadState("networkidle");
    });

    test.describe("single select", () => {
        test("show list of Companies with empty option on top of the list", async ({ page }) => {
            const menu = () => page.locator("text=FMC Corp");

            await page.locator(".mx-name-drop_downFilter2 input").click();
            await expect(menu()).toBeVisible();
            const list = page.locator("#DropdownFilter6-dropdown-list > li");
            await expect(list).toHaveCount(21);
            await expect(list.nth(0)).toHaveText("");
            await expect(list.nth(2)).toHaveText("FMC Corp");
            await expect(list.nth(20)).toHaveText("PETsMART Inc");
        });

        test("set value after option is clicked", async ({ page }) => {
            const select = () => page.getByRole("columnheader", { name: "Company" }).getByRole("textbox");
            const menu = () => page.locator("text=FMC Corp");
            const option1 = () => page.getByRole("menuitem", { name: "Brown-Forman Corporation" });
            const clickOutside = async () => page.locator("body").click();

            await select().click();
            await expect(menu()).toBeVisible();
            await option1().click();
            await expect(select()).toHaveValue("Brown-Forman Corporation");
            await clickOutside();
            await expect(menu()).not.toBeVisible();
            await expect(select()).toHaveValue("Brown-Forman Corporation");
            const rows = page.locator(".mx-name-dataGrid21 .tr");
            await expect(rows).toHaveCount(2);
        });
    });

    test.describe("multiselect", () => {
        test("shows list of Roles", async ({ page }) => {
            const select = () => page.getByRole("columnheader", { name: "Roles" }).getByRole("textbox");
            const menu = () => page.locator("text=Economist");
            const option1 = () => page.getByRole("menuitem", { name: "Economist" });
            const option2 = () => page.getByRole("menuitem", { name: "Public librarian" });
            const option3 = () => page.getByRole("menuitem", { name: "Prison officer" });

            await select().click();
            await expect(menu().first()).toBeVisible();
            await expect(option1()).toBeVisible();
            await expect(option2()).toBeVisible();
            await expect(option3()).toBeVisible();
        });

        test("does filtering when option is checked", async ({ page }) => {
            const select = () => page.getByRole("columnheader", { name: "Roles" }).getByRole("textbox");
            const option2 = () => page.getByRole("menuitem", { name: "Public librarian" });
            const clickOutside = async () => (await page.locator("body")).click();

            await select().click();
            await option2().click();
            await clickOutside();
            const rows = page.locator(".mx-name-dataGrid21 .tr");
            expect(rows).toHaveCount(5); // 4 rows + 1 header row
        });
    });

    test.describe("keep state of checked options", () => {
        const rows = () => page.$$(".mx-name-datagrid1 .tr");
        const select = () => page.getByRole("textbox", { name: "Filter" });
        const menu = () => page.$("text=Environmental scientist");
        const option1 = () => page.getByRole("menuitem", { name: "Environmental scientist" });
        const option2 = () => page.getByRole("menuitem", { name: "Trader" });
        const clickOutside = async () => (await page.$("body")).click();

        test("open menu with no options selected", async ({ page }) => {
            await select().click();
            const checkedOptions = await menu().$$("input:checked");
            expect(checkedOptions.length).toBe(0);
            await clickOutside();
            await expect(menu()).not.toBeVisible();
        });

        test("keep option checked after menu closed", async ({ page }) => {
            await select().click();
            await option1().click();
            const checkedOptions = await menu().$$("input:checked");
            expect(checkedOptions.length).toBe(1);
            await expect(checkedOptions[0]).toBeChecked();
            await clickOutside();
            await expect(menu()).not.toBeVisible();
            expect((await rows()).length).toBe(9); // 8 rows + 1 header row
            await select().click();
            const checkedOptionsAfterReopen = await menu().$$("input:checked");
            expect(checkedOptionsAfterReopen.length).toBe(1);
            await expect(checkedOptionsAfterReopen[0]).toBeChecked();
        });

        test("keep multiple options checked after menu closed", async ({ page }) => {
            await select().click();
            await option1().click();
            await option2().click();
            const checkedOptions = await menu().$$("input:checked");
            expect(checkedOptions.length).toBe(2);
            await expect(checkedOptions[0]).toBeChecked();
            await expect(checkedOptions[1]).toBeChecked();
            await clickOutside();
            await expect(menu()).not.toBeVisible();
            expect((await rows()).length).toBe(11); // 10 rows + 1 header row
            await select().click();
            const checkedOptionsAfterReopen = await menu().$$("input:checked");
            expect(checkedOptionsAfterReopen.length).toBe(2);
            await expect(checkedOptionsAfterReopen[0]).toBeChecked();
            await expect(checkedOptionsAfterReopen[1]).toBeChecked();
        });
    });
});
