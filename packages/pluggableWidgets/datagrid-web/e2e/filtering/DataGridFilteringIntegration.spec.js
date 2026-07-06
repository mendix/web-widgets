import { test, expect } from "@mendix/run-e2e/fixtures";
import { DataGridPage } from "../pages/DataGridPage";

test("datagrid-web filtering integration", async ({ page }) => {
    const grid = new DataGridPage(page, "dataGrid21");

    await grid.open("/p/filtering-integration");

    await expect(grid.rows).toHaveCount(51);

    await grid.headerTextbox("First name").fill("a");
    await expect(grid.rows).toHaveCount(30);

    await grid.headerTextbox("Birth date").fill("1/1/1990");
    await grid.headerTextbox("First name").click();
    await expect(grid.rows).toHaveCount(14);

    await grid.headerTextbox("Birth year").fill("1995");
    await expect(grid.rows).toHaveCount(9);

    await grid.headerCombobox("Color (enum)").click();
    await grid.option("Black").click({ delay: 1 });
    await expect(grid.rows).toHaveCount(4);

    await grid.headerCombobox("Roles (ref set)").click();
    await grid.option("Careers adviser").click({ delay: 1 });
    await expect(grid.rows).toHaveCount(3);

    await grid.headerCombobox("Company").click();
    await grid.option("Sierra Health Services Inc").click({ delay: 20 });
    await expect(grid.rows).toHaveCount(2);

    const row = grid.rows.nth(1);
    await expect(row).toHaveText(
        "Lina3/3/20042004BlackEnvironmental scientistCareers adviserPrison officerMarket research analystSierra Health Services Inc"
    );

    await expect(page).toHaveScreenshot(`datagridFilteringIntegration.png`);
});
