import { test, expect } from "@playwright/test";

test.describe("datagrid-web filtering multi select", () => {
    test("filter rows where enum attribute equal to one of selected values", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="menuitem"]:has-text("${label}")`);
        const enumSelect = () => page.locator(".mx-name-drop_downFilter1 input");
        const rowCount = await rows();
        await page.goto("/p/filtering-multi");
        await page.waitForLoadState("networkidle");
        await expect(rowCount).toHaveCount(11);
        await expect(await column(2).first()).toHaveText("Black");
        await expect(await column(2).last()).toHaveText("Blue");
        await enumSelect().click();
        await option("Pink").click();
        await expect(await rows()).toHaveCount(6);
        await option("Blush").click();
        await expect(await rows()).toHaveCount(8);
        await page.getByRole("columnheader", { name: "sort Color (enum) Blush,Pink" }).getByRole("textbox").click();
        const columnText = await column(2).allTextContents();
        await expect(columnText).toEqual(
            expect.arrayContaining(["Pink", "Pink", "Pink", "Blush", "Blush", "Pink", "Pink"])
        );
    });

    test("filter rows where ReferenceSet contains at least one of selected objects", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="menuitem"]:has-text("${label}")`);
        const roleSelect = () => page.locator(".mx-name-drop_downFilter3 input");
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
        await page.goto("/p/filtering-multi");
        await page.waitForLoadState("networkidle");
        await expect(await column(3).first()).toHaveText(expectedColumnText[0]);
        await roleSelect().click();
        await option("Economist").click();
        await expect(await rows()).toHaveCount(6);
        await option("Public librarian").click();
        await expect(await rows()).toHaveCount(10);
        await page.getByRole('columnheader', { name: 'Roles (ref set) Economist,' }).getByRole('textbox').click();
        const columnTexts = await column(3).allTextContents();
        expectedColumnText.forEach((text, index) => {
            expect(columnTexts[index]).toBe(text);
        });
    });

    test("filter rows where Reference equal to one of selected objects", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="menuitem"]:has-text("${label}")`);
        const companySelect = () => page.locator(".mx-name-drop_downFilter4 input");

        const rowCount = await rows();
        await page.goto("/p/filtering-multi");
        await page.waitForLoadState("networkidle");
        await expect(rowCount).toHaveCount(11);
        await expect(await column(4).first()).toHaveText("W.R. Berkley Corporation");
        await expect(await column(4).last()).toHaveText("PETsMART Inc");
        await companySelect().click();
        await option("FMC Corp").click();
        await expect(await rows()).toHaveCount(2);
        await option("ALLETE, Inc.").click();
        await expect(await rows()).toHaveCount(6);
        await page.getByRole('columnheader', { name: 'sort Company FMC Corp,ALLETE' }).getByRole('textbox').click();
        const columnText = await column(4).allTextContents();
        expect(columnText).toEqual(expect.arrayContaining(["ALLETE, Inc.", "FMC Corp", "ALLETE, Inc.", "ALLETE, Inc.", "ALLETE, Inc."]));
    });
});
