import { expect, test } from "@mendix/run-e2e/fixtures";

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

            // Arrange: three chips, so a middle one exists.
            const chips = comboBox.locator(".widget-combobox-selected-item");
            const options = comboBox.locator("[role=listbox] [role=option]");
            await comboBox.click();
            for (let selected = 0; selected < 3; selected++) {
                await expect(options.first()).toBeVisible();
                await options.first().click({ delay: 10 });
                await expect(chips).toHaveCount(selected + 1);
            }

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
    }
});
