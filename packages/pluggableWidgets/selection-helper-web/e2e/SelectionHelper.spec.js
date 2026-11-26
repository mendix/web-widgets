import { test, expect } from "@mendix/run-e2e/fixtures";

test.describe("selection-helper-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("check box style in a gallery", () => {
        const gallery = page => page.locator(".mx-name-gallery1");
        const items = page => gallery(page).getByRole("option");
        const helper = page => page.locator(".mx-name-selectionHelperCheckbox");
        const helperCheckbox = page => helper(page).getByRole("checkbox");

        test("shows the caption next to an unchecked check box", async ({ page }) => {
            await expect(items(page)).toHaveCount(4);

            await expect(helper(page).locator("label")).toHaveText("Select all items");
            await expect(helperCheckbox(page)).not.toBeChecked();
            await expect(helperCheckbox(page)).toHaveJSProperty("indeterminate", false);
        });

        test("selects every item on the page", async ({ page }) => {
            await expect(items(page)).toHaveCount(4);

            await helperCheckbox(page).click();

            for (const item of await items(page).all()) {
                await expect(item).toHaveAttribute("aria-selected", "true");
            }
            await expect(helperCheckbox(page)).toBeChecked();
        });

        test("clears the selection when every item is selected", async ({ page }) => {
            await expect(items(page)).toHaveCount(4);
            await helperCheckbox(page).click();
            await expect(helperCheckbox(page)).toBeChecked();

            await helperCheckbox(page).click();

            for (const item of await items(page).all()) {
                await expect(item).toHaveAttribute("aria-selected", "false");
            }
            await expect(helperCheckbox(page)).not.toBeChecked();
        });

        test("shows a partial selection as indeterminate", async ({ page }) => {
            await items(page).filter({ hasText: "Beta" }).click();

            await expect(items(page).filter({ hasText: "Beta" })).toHaveAttribute("aria-selected", "true");
            await expect(helperCheckbox(page)).toHaveJSProperty("indeterminate", true);
        });

        test("selects every item when the selection is partial", async ({ page }) => {
            await items(page).filter({ hasText: "Beta" }).click();
            await expect(helperCheckbox(page)).toHaveJSProperty("indeterminate", true);

            await helperCheckbox(page).click();

            for (const item of await items(page).all()) {
                await expect(item).toHaveAttribute("aria-selected", "true");
            }
            await expect(helperCheckbox(page)).toBeChecked();
        });
    });

    test.describe("custom style in a data grid", () => {
        const rows = page =>
            page
                .locator(".mx-name-dataGrid1")
                .getByRole("row")
                .filter({ hasText: /Alpha|Beta|Gamma|Delta/ });
        const helper = page => page.locator(".mx-name-selectionHelperCustom");

        test("shows the widgets for the current selection state", async ({ page }) => {
            await expect(rows(page)).toHaveCount(4);
            await expect(helper(page)).toHaveText("None selected");

            await rows(page).filter({ hasText: "Gamma" }).getByRole("checkbox").click();
            await expect(helper(page)).toHaveText("Some selected");

            await helper(page).getByText("Some selected").click();
            await expect(helper(page)).toHaveText("All selected");
            for (const row of await rows(page).all()) {
                await expect(row).toHaveAttribute("aria-selected", "true");
            }

            await helper(page).getByText("All selected").click();
            await expect(helper(page)).toHaveText("None selected");
            for (const row of await rows(page).all()) {
                await expect(row).toHaveAttribute("aria-selected", "false");
            }
        });
    });

    test("shows an error outside a list with multi-selection", async ({ page }) => {
        const helper = page.locator(".mx-name-containerOutside");

        await expect(helper.locator(".alert-danger")).toContainText("The Selection Helper widget should be placed");
        await expect(helper.getByRole("checkbox")).toHaveCount(0);
    });
});
