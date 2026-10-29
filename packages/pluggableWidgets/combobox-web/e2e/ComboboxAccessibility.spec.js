import { expect, test } from "@mendix/run-e2e/fixtures";
import { checkAccessibility } from "@mendix/run-e2e/mendix-helpers";
import Combobox from "./utils/Combobox.pageObject";

// The ARIA contract of the widget. A replacement of the rendering must keep every attribute
// asserted here, so these tests deliberately read attributes instead of widget class names.
// Selections made on the popup page survive within one Mendix session, hence the clearing.

async function clearSelection(combobox) {
    if ((await combobox.clearButton.count()) > 0) {
        await combobox.clearButton.click();
    }
    await expect(combobox.clearButton).toHaveCount(0);
}

test.describe("combobox-web accessibility", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.locator(".mx-name-actionButton1").first().click();
        await expect(page.locator(".modal-body .mx-name-comboBox2")).toBeVisible({ timeout: 10000 });
    });

    test("implements the combobox pattern on the single select", async ({ page }) => {
        const widget = page.locator(".modal-body .mx-name-comboBox2");
        const combobox = new Combobox(widget);
        const labelId = await widget.locator("label").getAttribute("id");
        const listboxId = await combobox.listbox.getAttribute("id");

        await expect(combobox.input).toHaveAttribute("role", "combobox");
        await expect(combobox.input).toHaveAttribute("aria-autocomplete", "list");
        await expect(combobox.input).toHaveAttribute("aria-expanded", "false");
        await expect(combobox.input).toHaveAttribute("aria-controls", listboxId);
        await expect(combobox.input).toHaveAttribute("aria-labelledby", labelId);
        await expect(combobox.input).toHaveAttribute("aria-required", "false");
        await expect(combobox.listbox).toHaveAttribute("aria-labelledby", labelId);
        await expect(combobox.options).toHaveCount(0);

        await combobox.open();

        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        await expect(combobox.options).toHaveCount(6);
        const firstId = await combobox.option(0).getAttribute("id");
        await expect(combobox.input).toHaveAttribute("aria-activedescendant", firstId);
        await expect(combobox.selectedOptions).toHaveCount(0);

        await page.keyboard.press("Enter");
        await combobox.open();
        await expect(combobox.option(0)).toHaveAttribute("aria-selected", "true");
        await expect(combobox.selectedOptions).toHaveCount(1);
    });

    test("marks selected options and their checkboxes on the multi select", async ({ page }) => {
        const combobox = new Combobox(page.locator(".modal-body .mx-name-comboBox1"));
        await clearSelection(combobox);
        await combobox.open();

        await page.keyboard.press("ArrowDown");
        const firstId = await combobox.option(0).getAttribute("id");
        await expect(combobox.input).toHaveAttribute("aria-activedescendant", firstId);
        await page.keyboard.press("Enter");
        await expect(combobox.option(0)).toHaveAttribute("aria-selected", "true");
        await expect(combobox.option(0).getByRole("checkbox")).toBeChecked();
        await expect(combobox.option(1)).toHaveAttribute("aria-selected", "false");
        await expect(combobox.option(1).getByRole("checkbox")).not.toBeChecked();

        const checked = await combobox.options.getByRole("checkbox", { checked: true }).count();
        await expect(combobox.selectedOptions).toHaveCount(checked);
    });

    test("names the clear and remove controls", async ({ page }) => {
        const single = new Combobox(page.locator(".modal-body .mx-name-comboBox2"));
        await single.open();
        await page.keyboard.press("Enter");
        await expect(single.clearButton).toBeVisible();

        await page.locator(".mx-name-tabPage2").click();
        const chips = new Combobox(page.locator(".modal-body .mx-name-comboBox4"));
        await clearSelection(chips);
        await chips.open();
        await page.keyboard.press("ArrowDown");
        const firstChipOptionId = await chips.option(0).getAttribute("id");
        await expect(chips.input).toHaveAttribute("aria-activedescendant", firstChipOptionId);
        await page.keyboard.press("Enter");
        await expect(chips.chips).toHaveCount(1);
        await expect(chips.chipRemoveButtons).toHaveCount(1);
        await expect(chips.clearButton).toBeVisible();
    });

    test("a read-only combobox is disabled and never opens", async ({ page }) => {
        await page.locator(".mx-name-tabPage2").click();
        const combobox = new Combobox(page.locator(".modal-body .mx-name-comboBox6"));

        await expect(combobox.input).toBeDisabled();
        await expect(combobox.toggle).toHaveCount(0);
        await expect(combobox.clearButton).toHaveCount(0);

        await combobox.root.locator(".widget-combobox-input-container").click({ force: true });
        await expect(combobox.input).toHaveAttribute("aria-expanded", "false");
        await expect(combobox.options).toHaveCount(0);
    });

    test("passes the axe scan when closed and when open", async ({ page }) => {
        const combobox = new Combobox(page.locator(".modal-body .mx-name-comboBox2"));
        await checkAccessibility(page, ".modal-body .mx-name-comboBox2");

        await combobox.open();
        await expect(combobox.options).toHaveCount(6);
        await checkAccessibility(page, ".modal-body .mx-name-comboBox2");
    });
});
