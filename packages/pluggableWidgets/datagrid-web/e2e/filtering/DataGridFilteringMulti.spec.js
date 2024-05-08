import { test, expect } from "@playwright/test";

test("datagrid-web filtering multi select", async ({ page }) => {
    const rows = async () => page.locator('.mx-name-dataGrid21 [role="row"]');
    const column = n => rows().locator(`[role="gridcell"]:nth-child(${n})`);
    const option = label => page.locator(`[role="menuitem"]:has-text("${label}")`);
    const enumSelect = () => page.locator(".mx-name-drop_downFilter1 input");
    const roleSelect = () => page.locator(".mx-name-drop_downFilter3 input");
    const companySelect = () => page.locator(".mx-name-drop_downFilter4 input");

    await page.goto("/p/filtering-multi");

    test("filter rows where enum attribute equal to one of selected values", async () => {
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        await expect(await column(2).first()).toHaveText("Black");
        await expect(await column(2).last()).toHaveText("Blue");
        await enumSelect().click();
        await option("Pink").click();
        await expect(await rows()).toHaveCount(6);
        await option("Blush").click();
        await expect(await rows()).toHaveCount(8);
        await enumSelect().click();
        const columnText = await column(2).allTextContents();
        expect(columnText).toBe("PinkPinkPinkBlushBlushPinkPink");
    });

    test("filter rows where ReferenceSet contains at least one of selected objects", async () => {
        const expectedColumnText = [
            "EconomistArmed forces officerTraderHealth service manager",
            "EconomistArmed forces officerTrader",
            "EconomistEditorial assistantArmed forces officer",
            "Public librarianImmunologistWaste disposal officer",
            "Public librarianMaterials specialistWaste disposal officer",
            "EconomistNanoscientist",
            "Economist",
            "Homeless workerEditorial assistantPublic librarian",
            "Environmental scientistPublic librarianMaterials specialist"
        ];

        await expect(await column(3).first()).toHaveText(expectedColumnText[0]);
        await roleSelect().click();
        await option("Economist").click();
        await expect(await rows()).toHaveCount(6);
        await option("Public librarian").click();
        await expect(await rows()).toHaveCount(10);
        await roleSelect().click();
        const columnTexts = await column(3).allTextContents();
        expectedColumnText.forEach((text, index) => {
            expect(columnTexts[index]).toBe(text);
        });
    });

    test("filter rows where Reference equal to one of selected objects", async () => {
        const rowCount = await rows();
        await expect(rowCount).toHaveCount(11);
        await expect(await column(4).first()).toHaveText("W.R. Berkley Corporation");
        await expect(await column(4).last()).toHaveText("PETsMART Inc");
        await companySelect().click();
        await option("FMC Corp").click();
        await expect(await rows()).toHaveCount(2);
        await option("ALLETE, Inc.").click();
        await expect(await rows()).toHaveCount(6);
        await companySelect().click();
        const columnText = await column(4).allTextContents();
        expect(columnText).toBe("ALLETE, Inc.FMC CorpALLETE, Inc.ALLETE, Inc.ALLETE, Inc.");
    });
});
