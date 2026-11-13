import { test, expect } from "@mendix/run-e2e/fixtures";

/** The menu of a Pop-up Menu widget, without its nested submenus. */
const menuOf = (page, name) => page.locator(`.mx-name-${name} > .widget-popupmenu-root > .popupmenu-menu`);
/** The element that carries aria-expanded for the trigger content. */
const triggerWrapperOf = (page, name) => page.locator(`.mx-name-${name} > .popupmenu-trigger`);

test.describe("Popup-menu-web keyboard: menu without visible items", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/keyboard-empty-menu");
        // The Mendix client focuses the first focusable element after page load. Wait for it,
        // so it doesn't move focus away from the trigger in the middle of a test.
        await expect(page.locator(":focus")).toHaveCount(1);
    });

    for (const [title, popup, trigger] of [
        ["all items hidden", "popupAllHidden", "btnAllHiddenTrigger"],
        ["only dividers", "popupOnlyDividers", "btnOnlyDividersTrigger"]
    ]) {
        test.describe(title, () => {
            for (const key of ["Enter", "Space", "ArrowDown"]) {
                test(`doesn't open with ${key}`, async ({ page }) => {
                    const button = page.locator(`.mx-name-${trigger}`);
                    await button.focus();

                    await button.press(key);

                    await expect(triggerWrapperOf(page, popup)).toHaveAttribute("aria-expanded", "false");
                    await expect(menuOf(page, popup)).toHaveCount(0);
                    await expect(button).toBeFocused();
                });
            }

            test("doesn't open on click", async ({ page }) => {
                await page.locator(`.mx-name-${trigger}`).click();

                await expect(triggerWrapperOf(page, popup)).toHaveAttribute("aria-expanded", "false");
                await expect(menuOf(page, popup)).toHaveCount(0);
            });
        });
    }

    test.describe("empty submenu", () => {
        test("isn't announced on the parent item and doesn't open with ArrowRight", async ({ page }) => {
            const button = page.locator(".mx-name-btnEmptySubTrigger");
            await button.focus();
            await button.press("Enter");

            const parentItem = menuOf(page, "popupEmptySubRoot").getByRole("menuitem", { name: "Empty submenu" });
            await expect(parentItem).toBeFocused();
            await expect(parentItem).not.toHaveAttribute("aria-haspopup");

            await page.keyboard.press("ArrowRight");

            await expect(page.locator(".mx-name-popupEmptySub .popupmenu-menu")).toHaveCount(0);
            await expect(parentItem).toBeFocused();
        });
    });

    test.describe("item that becomes visible later", () => {
        test("doesn't pop up when the item appears, and opens on the next attempt", async ({ page }) => {
            const button = page.locator(".mx-name-btnLateItemTrigger");

            // An attempt to open while the menu is empty is refused...
            await button.click();
            await expect(menuOf(page, "popupLateItem")).toHaveCount(0);

            // ...and not remembered: the menu stays closed when the item becomes visible.
            await page.locator(".mx-name-cbShowLateItem input").check();
            await expect(page.locator(".mx-name-cbShowLateItem input")).toBeChecked();
            await expect(triggerWrapperOf(page, "popupLateItem")).toHaveAttribute("aria-expanded", "false");
            await expect(menuOf(page, "popupLateItem")).toHaveCount(0);

            await button.click();
            await expect(menuOf(page, "popupLateItem").getByRole("menuitem", { name: "Late item" })).toBeVisible();
        });
    });
});
