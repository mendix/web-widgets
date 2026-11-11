import { expect, test } from "@mendix/run-e2e/fixtures";
import Combobox from "./utils/Combobox.pageObject";

// The City overview page shows four comboboxes in a data view that follows the grid selection,
// which covers the configurations the popup page lacks: starts-with filtering, custom option
// content, filtering switched off, the select-all header and a menu footer with widgets.
// Both the page layout and this page contain a widget named comboBox1, hence the layoutGrid1 scope.
test.describe("combobox-web menu features on the city overview", () => {
    let scope;

    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.getByRole("button", { name: "City" }).click();
        // The country overview uses the same widget names, so wait for the city page itself.
        await expect(page).toHaveTitle(/City Overview/);
        scope = page.locator(".mx-page .mx-name-layoutGrid1");
        await expect(scope.locator(".mx-name-grid1 [role=row]").nth(1)).toBeVisible({ timeout: 10000 });
    });

    /**
     * Selects the first city in the grid. The first click on a freshly rendered grid is sometimes
     * taken by the grid's own focus handling, so the row is clicked until it reports the selection.
     */
    async function selectFirstCity() {
        const row = scope.locator(".mx-name-grid1 [role=row]").nth(1);
        for (let attempt = 0; attempt < 3 && (await row.getAttribute("aria-selected")) !== "true"; attempt++) {
            await row.locator("[role=gridcell]").first().click();
            await expect
                .poll(() => row.getAttribute("aria-selected"), { timeout: 2000 })
                .toBe("true")
                .catch(() => undefined);
        }
        await expect(row).toHaveAttribute("aria-selected", "true");
    }

    test("renders a placeholder until the context object is available", async () => {
        const combobox = new Combobox(scope.locator(".mx-name-comboBox2"));
        await expect(scope.locator(".mx-name-grid1 [role=row]").nth(1)).toHaveAttribute("aria-selected", "false");
        await expect(combobox.unavailablePlaceholder).toHaveCount(1);
        await expect(combobox.input).toHaveCount(0);

        await selectFirstCity();

        await expect(combobox.unavailablePlaceholder).toHaveCount(0);
        await expect(combobox.input).toHaveCount(1);
    });

    test("filters on the start of the caption when the filter type is starts with", async () => {
        await selectFirstCity();
        const combobox = new Combobox(scope.locator(".mx-name-comboBox1"));
        await combobox.open();
        await expect(combobox.options).toHaveCount(6);

        await combobox.filter("ne");
        await expect(combobox.options).toHaveCount(1);
        await expect(combobox.noOptionsPlaceholder).toHaveCount(0);

        // "land" occurs inside a caption but at the start of none.
        await combobox.filter("land");
        await expect(combobox.options).toHaveCount(0);
        await expect(combobox.noOptionsPlaceholder).toHaveCount(1);
    });

    test("renders the configured custom content inside every option", async () => {
        await selectFirstCity();
        const combobox = new Combobox(scope.locator(".mx-name-comboBox1"));
        await combobox.open();

        await expect(combobox.options).toHaveCount(6);
        await expect(combobox.options.locator(".mx-name-text3")).toHaveCount(6);
    });

    test("ignores typed text when filtering is switched off", async ({ page }) => {
        await selectFirstCity();
        const combobox = new Combobox(scope.locator(".mx-name-comboBox3"));
        await expect(combobox.input).toHaveAttribute("readonly", "");

        await combobox.open();
        await expect(combobox.input).toBeFocused();
        await page.keyboard.type("abc");

        await expect(combobox.input).toHaveValue("");
        await expect(combobox.options).toHaveCount(6);
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
    });

    test("the select all checkbox selects every option, clears them and shows the mixed state", async () => {
        await selectFirstCity();
        const combobox = new Combobox(scope.locator(".mx-name-comboBox3"));
        await combobox.open();

        // The association is shared with the other combobox on this page and may still hold a
        // selection from an earlier test. A mixed checkbox selects everything, a checked one clears
        // everything, so at most two clicks reach the empty state.
        for (let click = 0; click < 2 && (await combobox.selectAllCheckbox.isChecked()); click++) {
            await combobox.selectAllCheckbox.click();
            await expect(combobox.selectAllCheckbox).toHaveJSProperty("indeterminate", false);
        }
        await expect(combobox.selectAllCheckbox).not.toBeChecked();
        await expect(combobox.chips).toHaveCount(0);

        await combobox.selectAllCheckbox.click();
        await expect(combobox.chips).toHaveCount(6);
        await expect(combobox.selectedOptions).toHaveCount(6);
        await expect(combobox.selectAllCheckbox).toBeChecked();
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");

        await combobox.selectAllCheckbox.click();
        await expect(combobox.chips).toHaveCount(0);
        await expect(combobox.selectedOptions).toHaveCount(0);
        await expect(combobox.selectAllCheckbox).not.toBeChecked();

        await combobox.option(0).click({ delay: 10 });
        await expect(combobox.chips).toHaveCount(1);
        await expect(combobox.selectAllCheckbox).toBeChecked();
        await expect(combobox.selectAllCheckbox).toHaveJSProperty("indeterminate", true);
    });
});

test.describe("combobox-web menu footer", () => {
    /** @type {Combobox} */
    let combobox;

    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.locator(".mx-name-actionButton1").first().click();
        await page.locator(".mx-name-tabPage2").click();
        combobox = new Combobox(page.locator(".modal-body .mx-name-comboBox5"));
        await expect(combobox.root).toBeVisible({ timeout: 10000 });
    });

    test("keeps the menu open when the footer is clicked or focused", async ({ page }) => {
        await combobox.open();
        await expect(combobox.footer).toBeVisible();

        await combobox.footer.click();
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        await expect(combobox.footer).toBeFocused();

        // Tab from the footer leaves the widget and closes the menu.
        await page.keyboard.press("Tab");
        await expect(combobox.input).toHaveAttribute("aria-expanded", "false");
    });
});
