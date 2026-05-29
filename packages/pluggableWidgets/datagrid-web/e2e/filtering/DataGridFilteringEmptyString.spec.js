import { expect, test } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("datagrid-web filtering empty strings", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/filtering-empty-string");
        await waitForMendixApp(page);
    });

    test("filter rows by Empty and Not empty", async ({ page }) => {
        const column = n => page.locator(`[role="gridcell"]:nth-child(${n})`);
        const filter = n => page.locator(`[role="columnheader"]:nth-child(${n})`).locator(".filter-container");
        const filterSelectorButton = n => filter(n).getByRole("combobox");
        const filterSelectorOption = (n, name) =>
            filter(n).getByRole("listbox").getByRole("option", { name, exact: true });

        // all 3 records are shown
        await expect(column(1)).toHaveText(["User 1 (with value)", 'User 3 ("")', "User 3 (empty)"]);

        // select Empty option
        await filterSelectorButton(2).click({ delay: 20 });
        await filterSelectorOption(2, "Empty").click({ delay: 20 });

        // both, `empty` and `""` records are visible. Record with text is filtered out.
        await expect(column(1)).toHaveText(['User 3 ("")', "User 3 (empty)"]);

        // select "Not empty" option
        await filterSelectorButton(2).click({ delay: 20 });
        await filterSelectorOption(2, "Not empty").click({ delay: 20 });

        // Record with text is visible, `empty` and `""` records are filtered out.
        await expect(column(1)).toHaveText(["User 1 (with value)"]);
    });
});
