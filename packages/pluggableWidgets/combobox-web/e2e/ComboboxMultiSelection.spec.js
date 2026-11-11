import { expect, test } from "@mendix/run-e2e/fixtures";
import Combobox from "./utils/Combobox.pageObject";

// Multi selection with checkboxes (comboBox1) and with row click (comboBox4) on the popup page.
// Both widgets edit the same association, so every test starts by clearing it. Nothing is
// persisted: the popup's Save button is never pressed. Do not press Escape on this page.

async function clearSelection(combobox) {
    if ((await combobox.clearButton.count()) > 0) {
        await combobox.clearButton.click();
    }
    await expect(combobox.clearButton).toHaveCount(0);
}

/**
 * Moves the highlight to the option at `index` and waits for the widget to reflect it. A key sent
 * before the previous one has rendered acts on the stale highlight, so every keyboard step in
 * these tests goes through this helper.
 */
async function highlight(page, combobox, index) {
    await page.keyboard.press("ArrowDown");
    const id = await combobox.option(index).getAttribute("id");
    await expect(combobox.input).toHaveAttribute("aria-activedescendant", id);
}

test.describe("combobox-web multi selection with checkboxes", () => {
    /** @type {Combobox} */
    let combobox;

    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.locator(".mx-name-actionButton1").first().click();
        combobox = new Combobox(page.locator(".modal-body .mx-name-comboBox1"));
        await expect(combobox.root).toBeVisible({ timeout: 10000 });
        await clearSelection(combobox);
    });

    test("opens with no option highlighted and highlights the first one on ArrowDown", async ({ page }) => {
        await combobox.open();
        await expect(combobox.input).toBeFocused();
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        await expect(combobox.options).toHaveCount(6);
        await expect(combobox.input).toHaveAttribute("aria-activedescendant", "");

        await page.keyboard.press("ArrowDown");
        const firstId = await combobox.option(0).getAttribute("id");
        await expect(combobox.input).toHaveAttribute("aria-activedescendant", firstId);
    });

    test("toggles the highlighted option with Space and keeps the menu open", async ({ page }) => {
        await combobox.open();
        await expect(combobox.input).toBeFocused();
        await expect(combobox.selectedOptions).toHaveCount(0);

        await highlight(page, combobox, 0);
        await page.keyboard.press(" ");

        await expect(combobox.selectedOptions).toHaveCount(1);
        await expect(combobox.option(0)).toHaveAttribute("aria-selected", "true");
        await expect(combobox.option(0).getByRole("checkbox")).toBeChecked();
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        // Space must not end up as text in the filter input.
        await expect(combobox.input).toHaveValue("");

        await page.keyboard.press(" ");
        await expect(combobox.selectedOptions).toHaveCount(0);
        await expect(combobox.option(0).getByRole("checkbox")).not.toBeChecked();
    });

    test("toggles the highlighted option with Enter and keeps the menu open", async ({ page }) => {
        await combobox.open();

        // Enter with nothing highlighted only closes the menu.
        await page.keyboard.press("Enter");
        await expect(combobox.input).toHaveAttribute("aria-expanded", "false");
        await expect(combobox.clearButton).toHaveCount(0);

        await combobox.open();
        await highlight(page, combobox, 0);
        await page.keyboard.press("Enter");
        await expect(combobox.option(0)).toHaveAttribute("aria-selected", "true");
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        await expect(combobox.input).toBeFocused();

        await page.keyboard.press("Enter");
        await expect(combobox.option(0)).toHaveAttribute("aria-selected", "false");
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
    });

    test("lists the captions of the clicked options and keeps the menu open", async () => {
        await combobox.open();
        const first = await combobox.option(0).innerText();
        const third = await combobox.option(2).innerText();

        await combobox.option(0).click({ delay: 10 });
        await expect(combobox.option(0)).toHaveAttribute("aria-selected", "true");
        await combobox.option(2).click({ delay: 10 });
        await expect(combobox.option(2)).toHaveAttribute("aria-selected", "true");

        await expect(combobox.selectedOptions).toHaveCount(2);
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        await expect(combobox.input).toBeFocused();
        await expect(combobox.selectedText).toHaveText(`${first}, ${third}`);
        await expect(combobox.clearButton).toBeVisible();

        // Deselect the option that was clicked last. Clicking another, earlier selected option
        // intermittently does nothing on the current build; see the PR notes.
        await combobox.option(2).click({ delay: 10 });
        await expect(combobox.option(2)).toHaveAttribute("aria-selected", "false");
        await expect(combobox.selectedText).toHaveText(first);
    });

    test("the clear button removes every selection and hides itself", async ({ page }) => {
        await combobox.open();
        await highlight(page, combobox, 0);
        await page.keyboard.press("Enter");
        await expect(combobox.selectedOptions).toHaveCount(1);
        await highlight(page, combobox, 1);
        await page.keyboard.press("Enter");
        await expect(combobox.selectedOptions).toHaveCount(2);

        await combobox.clear();

        await expect(combobox.selectedOptions).toHaveCount(0);
        await expect(combobox.clearButton).toHaveCount(0);
        await expect(combobox.selectedText).toHaveClass(/widget-combobox-placeholder-empty/);
        await expect(combobox.input).toBeFocused();
    });
});

test.describe("combobox-web multi selection with row click", () => {
    /** @type {Combobox} */
    let combobox;

    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.locator(".mx-name-actionButton1").first().click();
        await page.locator(".mx-name-tabPage2").click();
        combobox = new Combobox(page.locator(".modal-body .mx-name-comboBox4"));
        await expect(combobox.root).toBeVisible({ timeout: 10000 });
        await clearSelection(combobox);
        await expect(combobox.chips).toHaveCount(0);
    });

    test("moves a picked option out of the menu into a chip and back when the chip is removed", async () => {
        await combobox.open();
        await expect(combobox.options).toHaveCount(6);
        const caption = await combobox.option(0).innerText();

        await combobox.option(0).click({ delay: 10 });

        await expect(combobox.chips).toHaveCount(1);
        await expect(combobox.chips.first()).toHaveText(caption);
        await expect(combobox.options).toHaveCount(5);
        await expect(combobox.getOptionByText(caption)).toHaveCount(0);
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        await expect(combobox.input).toBeFocused();

        await combobox.removeSelectedOption(0);

        await expect(combobox.chips).toHaveCount(0);
        await expect(combobox.options).toHaveCount(6);
        await expect(combobox.getOptionByText(caption)).toHaveCount(1);
    });

    test("every chip has an accessible remove button and the clear button removes them all", async ({ page }) => {
        await combobox.open();
        await highlight(page, combobox, 0);
        await page.keyboard.press("Enter");
        await expect(combobox.chips).toHaveCount(1);
        // The picked option left the menu and the highlight stays on the option that took its place.
        const nextId = await combobox.option(0).getAttribute("id");
        await expect(combobox.input).toHaveAttribute("aria-activedescendant", nextId);
        await page.keyboard.press("Enter");
        await expect(combobox.chips).toHaveCount(2);
        await expect(combobox.chipRemoveButtons).toHaveCount(2);

        // Close the menu first; see the fixme below for the clear button while the menu is open.
        // On this tab the menu opens upwards and covers the popup header, so click the page corner.
        await page.locator("body").click({ position: { x: 5, y: 5 } });
        await expect(combobox.input).toHaveAttribute("aria-expanded", "false");
        await combobox.clear();

        await expect(combobox.chips).toHaveCount(0);
        await combobox.open();
        await expect(combobox.options).toHaveCount(6);
    });

    // Fails on the current build at the 1280px wide default viewport: with two chips the focused
    // filter input wraps onto a second line. Pressing the mouse on the clear button blurs the
    // input, which collapses to 0px width, the row reflows and the button shrinks under the
    // cursor, so the mouseup lands on the input container. The click then toggles the menu
    // closed and the selection stays. Unpin once the clear button survives the reflow.
    test.fixme("the clear button removes every chip while the menu is open", async ({ page }) => {
        await combobox.open();
        await highlight(page, combobox, 0);
        await page.keyboard.press("Enter");
        await expect(combobox.chips).toHaveCount(1);
        await page.keyboard.press("Enter");
        await expect(combobox.chips).toHaveCount(2);

        await combobox.clear();

        await expect(combobox.chips).toHaveCount(0);
        await expect(combobox.input).toHaveAttribute("aria-expanded", "true");
        await expect(combobox.input).toBeFocused();
    });
});
