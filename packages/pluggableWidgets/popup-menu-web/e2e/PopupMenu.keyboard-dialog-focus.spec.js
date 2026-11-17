import { test, expect } from "@mendix/run-e2e/fixtures";

/** The menu of the Pop-up Menu with "Close on: Click outside", whose item opens a dialog. */
const menu = page => page.locator(".mx-name-popupDialogFocus > .widget-popupmenu-root > .popupmenu-menu");
const item = (page, caption) => menu(page).getByRole("menuitem", { name: caption });
const dialog = page => page.locator(".modal-dialog");

test.describe("Popup-menu-web keyboard: item that opens a dialog", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/keyboard-dialog-focus");
        // The Mendix client focuses the first focusable element after page load. Wait for it,
        // so it doesn't move focus away from the trigger in the middle of a test.
        await expect(page.locator(":focus")).toHaveCount(1);
    });

    test("keeps the menu open after an item click", async ({ page }) => {
        const trigger = page.locator(".mx-name-btnDialogFocusTrigger");
        await trigger.focus();
        await trigger.press("Enter");
        await expect(item(page, "Stay open")).toBeFocused();

        await page.keyboard.press("Enter");

        await expect(menu(page)).toBeVisible();
        await expect(item(page, "Stay open")).toBeFocused();
    });

    // Known issue: the item's action opens a dialog, which takes focus and closes the menu
    // ("Close on: Click outside" closes on focus out). On dismiss, the dialog returns focus to
    // the element that had it when the dialog opened: the menu item, which no longer exists.
    // Focus is lost to the document body. Restoring focus is up to the dialog, not the widget.
    test.fixme("returns focus to the trigger after the dialog is dismissed", async ({ page }) => {
        const trigger = page.locator(".mx-name-btnDialogFocusTrigger");
        await trigger.focus();
        await trigger.press("Enter");
        await page.keyboard.press("ArrowDown");
        await expect(item(page, "Opens dialog")).toBeFocused();

        await page.keyboard.press("Enter");
        await expect(dialog(page)).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog(page)).toBeHidden();

        await expect(trigger).toBeFocused();
    });
});
