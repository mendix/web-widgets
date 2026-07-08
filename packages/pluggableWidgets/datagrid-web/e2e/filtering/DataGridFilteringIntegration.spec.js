import { test, expect } from "@mendix/run-e2e/fixtures";
import { DataGridPage } from "../pages/DataGridPage";

test("datagrid-web filtering integration", async ({ page }) => {
    const grid = new DataGridPage(page, "dataGrid21");

    await page.goto("/p/filtering-integration");

    await expect(grid.rows).toHaveCount(51);

    await grid.headerTextbox("First name").fill("a");
    await expect(grid.rows).toHaveCount(30);

    await grid.headerTextbox("Birth date").fill("1/1/1990");
    await grid.headerTextbox("First name").click();
    await expect(grid.rows).toHaveCount(14);

    await grid.headerTextbox("Birth year").fill("1995");
    await expect(grid.rows).toHaveCount(9);

    // option() is page-scoped: the listbox is rendered by a sibling filter widget, not inside the grid root.
    await grid.headerCombobox("Color (enum)").click();
    await page.getByRole("option", { name: "Black", exact: true }).click({ delay: 1 });
    await expect(grid.rows).toHaveCount(4);

    await grid.headerCombobox("Roles (ref set)").click();
    await page.getByRole("option", { name: "Careers adviser", exact: true }).click({ delay: 1 });
    await expect(grid.rows).toHaveCount(3);

    await grid.headerCombobox("Company").click();
    await page.getByRole("option", { name: "Sierra Health Services Inc", exact: true }).click({ delay: 20 });
    await expect(grid.rows).toHaveCount(2);

    const row = grid.rows.nth(1);
    await expect(row).toHaveText(
        "Lina3/3/20042004BlackEnvironmental scientistCareers adviserPrison officerMarket research analystSierra Health Services Inc"
    );

    await expect(page).toHaveScreenshot(`datagridFilteringIntegration.png`);
});
