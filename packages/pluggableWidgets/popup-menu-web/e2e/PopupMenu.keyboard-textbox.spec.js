import { test, expect } from "@mendix/run-e2e/fixtures";

/** The menu of the Pop-up Menu whose trigger is a text box. */
const menu = page => page.locator(".mx-name-popupTextBox > .widget-popupmenu-root > .popupmenu-menu");
const item = (page, caption) => menu(page).getByRole("menuitem", { name: caption });
const textBox = page => page.locator(".mx-name-txtTrigger input");

test.describe("Popup-menu-web keyboard: text box in the trigger", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/keyboard-textbox-trigger");
        // The Mendix client focuses the first focusable element after page load. Wait for it,
        // so it doesn't move focus away from the text box in the middle of a test.
        await expect(page.locator(":focus")).toHaveCount(1);
    });

    // One key per test: Space would open the menu and Enter close it again within a single burst.
    for (const [name, keys, value] of [
        ["Space", ["a", "Space"], "a "],
        ["Enter", ["a", "Enter"], "a"]
    ]) {
        test(`keeps ${name} in the text box without opening the menu`, async ({ page }) => {
            const input = textBox(page);
            await input.focus();

            for (const key of keys) {
                await page.keyboard.press(key);
            }

            await expect(menu(page)).toBeHidden();
            await expect(input).toBeFocused();
            await expect(input).toHaveValue(value);
        });
    }

    test("opens the menu with ArrowDown, and Escape returns focus to the text box", async ({ page }) => {
        const input = textBox(page);
        await input.focus();

        await page.keyboard.press("ArrowDown");
        await expect(item(page, "Textbox item one")).toBeFocused();

        await page.keyboard.press("Escape");
        await expect(menu(page)).toBeHidden();
        await expect(input).toBeFocused();
    });

    test("opens the menu on click and keeps focus in the text box for typing", async ({ page }) => {
        const input = textBox(page);

        await input.click();
        await expect(menu(page)).toBeVisible();
        await page.keyboard.type("xyz");

        await expect(input).toHaveValue("xyz");
        await expect(input).toBeFocused();
    });
});
