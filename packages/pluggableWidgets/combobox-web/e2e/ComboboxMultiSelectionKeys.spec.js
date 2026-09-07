import { expect, test } from "@mendix/run-e2e/fixtures";

/**
 * Leaves the combobox with exactly `count` chips, in menu order.
 *
 * The test page ships this combobox with options already selected, so tests that address
 * chips by index clear it first and re-select from the top. Nothing is persisted — the
 * popup's Save button is never pressed — so this stays local to the test. In row click
 * selection mode selected options drop out of the menu, hence clicking the first option
 * each pass picks a new one.
 */
async function selectChips(comboBox, count) {
    const chips = comboBox.locator(".widget-combobox-selected-item");
    const options = comboBox.locator("[role=listbox] [role=option]");

    // Only the widget-level clear button is a <button>; a chip's own × is a <span>.
    await comboBox.locator("button.widget-combobox-clear-button").click();
    await expect(chips).toHaveCount(0);

    await comboBox.click();
    for (let selected = 0; selected < count; selected++) {
        await expect(options.first()).toBeVisible();
        await options.first().click({ delay: 10 });
        await expect(chips).toHaveCount(selected + 1);
    }
}

// Regression for WC-3347: in a multi-select combobox with at least one selected chip,
// selecting all filter text and pressing Backspace used to leave the text in place —
// the custom onKeyDown treated a select-all range (selectionStart === 0) as "caret at
// the start" and moved focus to the last chip, which reverted the pending input change.
// Delete never entered that branch, hence the reported Backspace/Delete asymmetry.
test.describe("combobox-web multi-selection filter input keys", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.click(".mx-name-actionButton1");
        await page.click(".mx-name-tabPage2");
    });

    for (const key of ["Backspace", "Delete"]) {
        test(`clears the filter for good when all text is selected and ${key} is pressed`, async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox4");
            await expect(comboBox).toBeVisible({ timeout: 10000 });

            // Arrange: select two options so chips exist. The bug only surfaces with at
            // least one chip — with none, setActiveIndex(-1) is a no-op.
            await comboBox.click();
            const options = comboBox.locator("[role=listbox] [role=option]");
            await expect(options.first()).toBeVisible();
            await options.nth(0).click({ delay: 10 });
            await options.nth(1).click({ delay: 10 });

            const chips = comboBox.locator(".widget-combobox-selected-item");
            await expect(chips.first()).toBeVisible();

            const input = comboBox.locator("input");
            await input.click();
            await page.keyboard.type("zzz");
            await expect(input).toHaveValue("zzz");

            // Act
            await input.press("ControlOrMeta+a");
            await input.press(key);

            // Assert: cleared immediately, and still cleared after leaving and re-entering
            // the widget. Click the container rather than the input: once the text is
            // genuinely gone the input can collapse to zero width and not be clickable.
            await expect(input).toHaveValue("");
            await page.locator("body").click({ position: { x: 5, y: 5 } });
            await comboBox.locator(".widget-combobox-input-container").click();
            await expect(input).toHaveValue("");
        });
    }

    test("Backspace with a partial text selection removes only the selected characters", async ({ page }) => {
        // The unit suite cannot cover this one: jsdom does not perform native text deletion,
        // so only a real browser shows whether the unselected tail survives.
        const comboBox = page.locator(".mx-name-comboBox4");
        await expect(comboBox).toBeVisible({ timeout: 10000 });

        // Chips are the precondition for the bug — with none, activating one is a no-op.
        const chips = comboBox.locator(".widget-combobox-selected-item");
        await expect(chips.first()).toBeVisible();

        const input = comboBox.locator("input");
        await input.click();
        await page.keyboard.type("abc");
        await expect(input).toHaveValue("abc");

        // Select "ab" without leaving the input: step the caret back over "c", then extend
        // the selection left to position 0. Pressing Home instead is not portable across
        // platforms in a text field.
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("Shift+ArrowLeft");
        await page.keyboard.press("Shift+ArrowLeft");

        // Act
        await page.keyboard.press("Backspace");

        // Assert: the selection is gone, the tail is kept, and no chip took the keystroke.
        await expect(input).toHaveValue("c");
        await expect(input).toBeFocused();
    });
});

// Regression for the chip-focus follow-up: removing a selected chip with Backspace/Delete
// used to drop keyboard focus to the document body unless the chip was the last one in the
// row. downshift only re-focuses when its own activeIndex changes, which it does not when a
// chip other than the last is removed.
test.describe("combobox-web multi-selection chip removal keys", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.click(".mx-name-actionButton1");
        await page.click(".mx-name-tabPage2");
    });

    for (const key of ["Backspace", "Delete"]) {
        test(`keeps keyboard focus on the selected items when ${key} removes a middle chip`, async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox4");
            await expect(comboBox).toBeVisible({ timeout: 10000 });

            // Arrange: exactly three chips, so a middle one exists and the indexes below are
            // unambiguous.
            const chips = comboBox.locator(".widget-combobox-selected-item");
            await selectChips(comboBox, 3);

            const input = comboBox.locator("input");
            await input.press("Escape");

            // Walk from the filter input onto the middle chip.
            await input.press("ArrowLeft");
            await expect(chips.nth(2)).toBeFocused();
            await page.keyboard.press("ArrowLeft");
            await expect(chips.nth(1)).toBeFocused();

            // Act
            await page.keyboard.press(key);

            // Assert: the chip is gone and focus moved to the chip that took its place,
            // so navigation continues instead of falling back to the page.
            await expect(chips).toHaveCount(2);
            await expect(chips.nth(1)).toBeFocused();
            await page.keyboard.press("ArrowLeft");
            await expect(chips.nth(0)).toBeFocused();
        });

        test(`returns focus to the filter input when ${key} removes the only chip`, async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox4");
            await expect(comboBox).toBeVisible({ timeout: 10000 });

            const chips = comboBox.locator(".widget-combobox-selected-item");
            await selectChips(comboBox, 1);

            const input = comboBox.locator("input");
            await input.press("Escape");
            await input.press("ArrowLeft");
            await expect(chips.first()).toBeFocused();

            // Act
            await page.keyboard.press(key);

            // Assert: with no chip left to hold focus it belongs in the filter input, so the
            // user can keep typing instead of tabbing back into the widget.
            await expect(chips).toHaveCount(0);
            await expect(input).toBeFocused();
        });
    }

    test("Backspace on an empty filter input reaches the last chip and removes it on the second press", async ({
        page
    }) => {
        // The gating rewrite that fixed WC-3347 must not cost the shortcut it gates: Backspace
        // on an empty filter input still has to walk into the chips.
        const comboBox = page.locator(".mx-name-comboBox4");
        await expect(comboBox).toBeVisible({ timeout: 10000 });

        const chips = comboBox.locator(".widget-combobox-selected-item");
        await selectChips(comboBox, 3);

        const input = comboBox.locator("input");
        await input.press("Escape");
        await expect(input).toHaveValue("");

        // Act
        await input.press("Backspace");
        await expect(chips.nth(2)).toBeFocused();
        await page.keyboard.press("Backspace");

        // Assert: the last chip is gone and focus moved to the chip on its left.
        await expect(chips).toHaveCount(2);
        await expect(chips.nth(1)).toBeFocused();
    });
});
