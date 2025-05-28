import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("datagrid-web filtering single select", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/filtering-single");
        await page.waitForLoadState("networkidle");
    });

    test("compares with a screenshot baseline and checks if all datagrid and filter elements are rendered as expected", async ({
        page
    }) => {
        await expect(page.locator(".mx-name-dataGrid21")).toBeVisible();

        await expect(page).toHaveScreenshot(`datagridFilteringSingle.png`);
    });

    test("filter rows that have Yes in Pets column", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="option"]:has-text("${label}")`);
        const booleanSelect = () => page.locator(".mx-name-drop_downFilter2").getByRole("combobox");

        await booleanSelect().click();
        await option("Yes").click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        const columnTexts = await column(3).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("Yes"));
    });

    test("filter rows that have No in Pets column", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const booleanSelect = () => page.locator(".mx-name-drop_downFilter2").getByRole("combobox");

        await booleanSelect().click();

        await page.getByRole("option", { name: "No", exact: true }).click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        const columnTexts = await column(3).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("No"));
    });

    test("reset filter state when empty option is clicked", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="option"]:has-text("${label}")`);
        const booleanSelect = () => page.locator(".mx-name-drop_downFilter2").getByRole("combobox");

        await booleanSelect().click();
        await option("Yes").click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        await expect(await column(3).allTextContents()).toEqual(
            expect.arrayContaining(["Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes"])
        );
        await booleanSelect().click();
        await page.getByRole("row", { name: "Pets (bool)" }).getByRole("option").first().click();
        const columnText = await column(3).allTextContents();
        expect(columnText).toEqual(
            expect.arrayContaining(["Yes", "Yes", "Yes", "No", "Yes", "No", "No", "Yes", "No", "Yes"])
        );
    });

    test("filter rows that have Cyan in Color column", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="option"]:has-text("${label}")`);
        const enumSelect = () => page.locator(".mx-name-drop_downFilter1").getByRole("combobox");

        await enumSelect().click();
        await option("Cyan").click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(6);
        const columnTexts = await column(2).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("Cyan"));
    });

    test("filter rows that have Black in Color column", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="option"]:has-text("${label}")`);
        const enumSelect = () => page.locator(".mx-name-drop_downFilter1").getByRole("combobox");

        await enumSelect().click();
        await option("Black").click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(9);
        const columnTexts = await column(2).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("Black"));
    });

    test("filter rows that match selected role", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="option"]:has-text("${label}")`);
        const roleSelect = () => page.locator(".mx-name-drop_downFilter3").getByRole("combobox");

        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        await roleSelect().click();
        await option("Trader").click();
        const rowCount2 = await rows();
        await expect(rowCount2).toHaveCount(8);
        const columnTexts = await column(4).allTextContents();
        columnTexts.forEach(text => expect(text).toContain("Trader"));
    });

    test("filter rows that match selected company", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="option"]:has-text("${label}")`);
        const companySelect = () => page.locator(".mx-name-drop_downFilter4").getByRole("combobox");

        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        await companySelect().click();
        await option("PETsMART Inc").click();
        const rowCount2 = await rows();
        await expect(rowCount2).toHaveCount(9);
        const columnTexts = await column(5).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("PETsMART Inc"));
    });
});
