import { test, expect } from "@playwright/test";

test("datagrid-web filtering integration", async ({ page }) => {
    await page.goto("/p/filtering-integration");

    const select = async name => {
        const columnHeader = await page.locator(`[role="columnheader"]:has-text("${name}")`);
        return columnHeader.locator("input");
    };

    const option = async label => {
        return page.locator(`[role="menuitem"]:has-text("${label}")`);
    };

    const rows = async () => {
        return page.locator('.mx-name-dataGrid21 [role="row"]');
    };

    const rowCount = await rows();
    await expect(rowCount).toHaveCount(51);

    await select("First name").type("a");
    await expect(await rows()).toHaveCount(30);

    await select("Birth date").type("1/1/1990");
    await select("First name").click(); // Remove calendar popup
    await expect(await rows()).toHaveCount(14);

    await select("Birth year").type("1995");
    await expect(await rows()).toHaveCount(9);

    await select("Color (enum)").click();
    await option("Black").click();
    await expect(await rows()).toHaveCount(4);

    await select("Roles (ref set)").click();
    await option("Careers adviser").click();
    await expect(await rows()).toHaveCount(3);

    await select("Company").click();
    await option("Sierra Health Services Inc").click();
    await expect(await rows()).toHaveCount(2);

    const row = (await rows()).nth(1);
    await expect(row).toHaveText(
        "Lina3/3/20042004BlackEnvironmental scientistCareers adviserPrison officerMarket research analystSierra Health Services Inc"
    );

    await expect(page).toHaveScreenshot(`datagridFilteringIntegration.png`);
});
