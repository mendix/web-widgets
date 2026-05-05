import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("datagrid-web filtering multi select", () => {
    test("filter rows where enum attribute equal to one of selected values", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="option"]:has-text("${label}")`);
        const enumSelect = () => page.locator(".mx-name-drop_downFilter1[role=combobox]");
        const rowCount = await rows();
        await page.goto("/p/filtering-multi");
        await waitForMendixApp(page);
        await expect(rowCount).toHaveCount(11);
        await expect(await column(2).first()).toHaveText("Black");
        await expect(await column(2).last()).toHaveText("Blue");
        await enumSelect().click();
        await option("Pink").click({ delay: 20 });
        await expect(await rows()).toHaveCount(6);
        await option("Blush").click({ delay: 20 });
        await expect(await rows()).toHaveCount(8);
        await page.getByRole("columnheader", { name: "Color (enum)" }).getByRole("combobox").click({ delay: 20 });
        await expect(column(2)).toContainText(["Pink", "Pink", "Pink", "Blush", "Blush", "Pink", "Pink"]);
    });

    test("filter rows where ReferenceSet contains at least one of selected objects", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="option"]:has-text("${label}")`);
        const roleSelect = () => page.locator(".mx-name-drop_downFilter3[role=combobox]");
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
        await waitForMendixApp(page);
        await expect(await column(3).first()).toHaveText(expectedColumnText[0]);
        await roleSelect().click();
        await option("Economist").click({ delay: 20 });
        await expect(await rows()).toHaveCount(6);
        await option("Public librarian").click({ delay: 20 });
        await expect(await rows()).toHaveCount(10);
        await roleSelect().click({ delay: 20 });
        await expect(column(3)).toHaveText(expectedColumnText);
    });

    test("filter rows where Reference equal to one of selected objects", async ({ page }) => {
        const rows = async () => {
            return page.locator('.mx-name-dataGrid21 [role="row"]');
        };
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const option = label => page.locator(`[role="option"]:has-text("${label}")`);
        const companySelect = () => page.locator(".mx-name-drop_downFilter4[role=combobox]");

        const rowCount = await rows();
        await page.goto("/p/filtering-multi");
        await waitForMendixApp(page);
        await expect(rowCount).toHaveCount(11);
        await expect(await column(4).first()).toHaveText("W.R. Berkley Corporation");
        await expect(await column(4).last()).toHaveText("PETsMART Inc");
        await companySelect().click({ delay: 20 });
        await option("FMC Corp").click({ delay: 20 });
        await expect(await rows()).toHaveCount(2);
        await option("ALLETE, Inc.").click({ delay: 20 });
        await expect(await rows()).toHaveCount(6);
        await page.getByRole("columnheader", { name: "Company" }).getByRole("combobox").click({ delay: 20 });
        await expect(column(4)).toContainText([
            "ALLETE, Inc.",
            "FMC Corp",
            "ALLETE, Inc.",
            "ALLETE, Inc.",
            "ALLETE, Inc."
        ]);
    });
});
