import { expect, test } from "@mendix/run-e2e/fixtures";
import Combobox from "./utils/Combobox.pageObject";

// Single selection (enumeration) on the popup page. Do not press Escape here: the Mendix client
// closes the popup on Escape and the widget leaves the DOM (see ComboboxMultiSelectionKeys.spec.js).
test.describe("combobox-web single selection keyboard navigation", () => {
    /** @type {Combobox} */
    let combobox;

    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.locator(".mx-name-actionButton1").first().click();
        combobox = new Combobox(page.locator(".modal-body .mx-name-comboBox2"));
        await expect(combobox.root).toBeVisible({ timeout: 10000 });
    });

    /** aria-activedescendant on the input must point at the highlighted option. */
    async function expectHighlighted(index) {
        await expect(combobox.option(index)).toHaveAttribute("id", /.+/);
        const id = await combobox.option(index).getAttribute("id");
        await expect(combobox.input).toHaveAttribute("aria-activedescendant", id);
    }

    test("moves the highlight with the arrow keys and selects the highlighted option with Enter", async ({ page }) => {
        await combobox.open();
        await expect(combobox.input).toBeFocused();
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        await expect(combobox.options).toHaveCount(6);
        await expectHighlighted(0);

        await page.keyboard.press("ArrowDown");
        await expectHighlighted(1);
        await page.keyboard.press("ArrowDown");
        await expectHighlighted(2);
        await page.keyboard.press("ArrowUp");
        await expectHighlighted(1);

        const caption = await combobox.option(1).innerText();
        await page.keyboard.press("Enter");

        // Selecting closes the menu, shows the caption and leaves the filter input focused and empty.
        await expect(combobox.input).toHaveAttribute("aria-expanded", "false");
        await expect(combobox.selectedText).toHaveText(caption);
        await expect(combobox.input).toBeFocused();
        await expect(combobox.input).toHaveValue("");
        await expect(combobox.clearButton).toBeVisible();
    });

    test("jumps to the last and first option with End and Home", async ({ page }) => {
        await combobox.open();
        await expectHighlighted(0);

        await page.keyboard.press("End");
        await expectHighlighted(5);
        await page.keyboard.press("Home");
        await expectHighlighted(0);
    });

    test("typing into the closed combobox opens the menu with the matching options", async ({ page }) => {
        // Focus without opening: the empty input is 0px wide, so a click cannot land on it.
        await combobox.input.focus();
        await expect(combobox.input).toHaveAttribute("aria-expanded", "false");

        await page.keyboard.type("eu");

        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        await expect(combobox.options).toHaveCount(1);
        await expectHighlighted(0);

        const caption = await combobox.option(0).innerText();
        await page.keyboard.press("Enter");
        await expect(combobox.selectedText).toHaveText(caption);
        await expect(combobox.input).toHaveValue("");
    });

    test("leaving the widget with Tab closes the menu and drops the filter text but keeps the selection", async ({
        page
    }) => {
        await combobox.open();
        await expect(combobox.options).toHaveCount(6);
        const caption = await combobox.option(0).innerText();
        await page.keyboard.press("Enter");
        await expect(combobox.selectedText).toHaveText(caption);

        await page.keyboard.type("a");
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");

        // The clear button sits between the input and the next widget; the menu stays open while
        // focus is still inside the widget.
        await page.keyboard.press("Tab");
        await expect(combobox.clearButton).toBeFocused();
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");

        await page.keyboard.press("Tab");
        await expect(page.locator(".modal-body .mx-name-comboBox3 input[role=combobox]")).toBeFocused();
        await expect(combobox.input).toHaveAttribute("aria-expanded", "false");
        await expect(combobox.input).toHaveValue("");
        await expect(combobox.selectedText).toHaveText(caption);
    });

    test("clicking outside closes the menu and drops the filter text but keeps the selection", async ({ page }) => {
        await combobox.open();
        await expect(combobox.options).toHaveCount(6);
        const caption = await combobox.option(0).innerText();
        await page.keyboard.press("Enter");
        await expect(combobox.selectedText).toHaveText(caption);

        await combobox.input.focus();
        await page.keyboard.type("a");
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");

        await page.locator(".modal-header").first().click();

        await expect(combobox.input).toHaveAttribute("aria-expanded", "false");
        await expect(combobox.input).toHaveValue("");
        await expect(combobox.selectedText).toHaveText(caption);
    });

    test("shows the no options placeholder when the filter matches nothing", async () => {
        await combobox.open();
        await combobox.filter("zzz");

        await expect(combobox.options).toHaveCount(0);
        await expect(combobox.noOptionsPlaceholder).toHaveCount(1);
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");

        await combobox.filter("");
        await expect(combobox.options).toHaveCount(6);
        await expect(combobox.noOptionsPlaceholder).toHaveCount(0);
    });

    test("clears the selection with the clear button and returns focus to the input", async ({ page }) => {
        await combobox.open();
        await page.keyboard.press("Enter");
        await expect(combobox.clearButton).toBeVisible();

        await combobox.clear();

        await expect(combobox.selectedText).toHaveClass(/widget-combobox-placeholder-empty/);
        await expect(combobox.clearButton).toHaveCount(0);
        await expect(combobox.input).toBeFocused();
    });
});
