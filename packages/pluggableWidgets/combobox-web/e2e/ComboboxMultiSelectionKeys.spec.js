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
