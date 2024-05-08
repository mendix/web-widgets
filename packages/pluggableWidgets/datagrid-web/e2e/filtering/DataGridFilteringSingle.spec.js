import { test, expect } from "@playwright/test";

test("datagrid-web filtering single select", async ({ page }) => {
    const rows = async () => page.locator('.mx-name-dataGrid21 [role="row"]');
    const column = n => rows().locator(`[role="gridcell"]:nth-child(${n})`);
    const option = label => page.locator(`[role="menuitem"]:has-text("${label}")`);
    const enumSelect = () => page.locator(".mx-name-drop_downFilter1 input");
    const booleanSelect = () => page.locator(".mx-name-drop_downFilter2 input");
    const roleSelect = () => page.locator(".mx-name-drop_downFilter3 input");
    const companySelect = () => page.locator(".mx-name-drop_downFilter4 input");

    await page.goto("/p/filtering-single");

    await expect(page.locator(".mx-name-dataGrid21")).toBeVisible();

    await expect(page).toHaveScreenshot(`datagrid.png`);

    test("filter rows that have Yes in Pets column", async () => {
        await booleanSelect().click();
        await option("Yes").click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        const columnTexts = await column(3).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("Yes"));
    });

    test("filter rows that have No in Pets column", async () => {
        await booleanSelect().click();
        await option("No").click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        const columnTexts = await column(3).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("No"));
    });

    test("reset filter state when empty option is clicked", async () => {
        await booleanSelect().click();
        await option("Yes").click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        await expect(await column(3).allTextContents()).toBe("YesYesYesYesYesYesYesYesYesYes");
        await booleanSelect().click();
        await option("").click();
        const columnText = await column(3).allTextContents();
        expect(columnText).toBe("YesYesYesNoYesNoNoYesNoYes");
    });

    test("filter rows that have Cyan in Color column", async () => {
        await enumSelect().click();
        await option("Cyan").click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(6);
        const columnTexts = await column(2).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("Cyan"));
    });

    test("filter rows that have Black in Color column", async () => {
        await enumSelect().click();
        await option("Black").click();
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(9);
        const columnTexts = await column(2).allTextContents();
        columnTexts.forEach(text => expect(text).toBe("Black"));
    });

    test("filter rows that match selected role", async () => {
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        await roleSelect().click();
        await option("Trader").click();
        const rowCount2 = await rows();
        await expect(rowCount2).toHaveCount(8);
        const columnTexts = await column(4).allTextContents();
        columnTexts.forEach(text => expect(text).toContain("Trader"));
    });

    test("filter rows that match selected company", async () => {
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
