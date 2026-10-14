import { test, expect } from "@mendix/run-e2e/fixtures";

/** The menu of a Pop-up Menu widget, without its nested submenus. */
const menuOf = (page, name) => page.locator(`.mx-name-${name} > .widget-popupmenu-root > .popupmenu-menu`);
const itemOf = (page, name, caption) => menuOf(page, name).getByRole("menuitem", { name: caption });
const dialog = page => page.locator(".modal-dialog");

test.describe("Popup-menu-web keyboard", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/keyboard");
        // The Mendix client focuses the first focusable element after page load. Wait for it,
        // so it doesn't move focus away from the trigger in the middle of a test.
        await expect(page.locator(":focus")).toHaveCount(1);
    });

    test.describe("trigger", () => {
        for (const key of ["Enter", "Space", "ArrowDown"]) {
            test(`opens the menu with ${key} and focuses the first item`, async ({ page }) => {
                const trigger = page.locator(".mx-name-btnBasicTrigger");
                await trigger.focus();

                await trigger.press(key);

                await expect(itemOf(page, "pop_upMenu1", "First")).toBeFocused();
            });
        }

        test("opens the menu with ArrowUp and focuses the last item", async ({ page }) => {
            const trigger = page.locator(".mx-name-btnBasicTrigger");
            await trigger.focus();

            await trigger.press("ArrowUp");

            await expect(itemOf(page, "pop_upMenu1", "Last")).toBeFocused();
        });

        test("focuses the first item when opened by click, and closes on a second click", async ({ page }) => {
            const trigger = page.locator(".mx-name-btnBasicTrigger");

            await trigger.click();
            await expect(itemOf(page, "pop_upMenu1", "First")).toBeFocused();

            await trigger.click();
            await expect(menuOf(page, "pop_upMenu1")).toBeHidden();
        });

        test("closes the menu with Escape and returns focus to the trigger", async ({ page }) => {
            const trigger = page.locator(".mx-name-btnBasicTrigger");
            await trigger.focus();
            await trigger.press("Enter");
            await expect(itemOf(page, "pop_upMenu1", "First")).toBeFocused();

            await page.keyboard.press("Escape");

            await expect(menuOf(page, "pop_upMenu1")).toBeHidden();
            await expect(trigger).toBeFocused();
        });
    });

    test.describe("items", () => {
        test("navigates with arrows, skips the divider, wraps, and supports Home/End", async ({ page }) => {
            const trigger = page.locator(".mx-name-btnBasicTrigger");
            await trigger.focus();
            await trigger.press("Enter");
            await expect(itemOf(page, "pop_upMenu1", "First")).toBeFocused();

            await page.keyboard.press("ArrowDown");
            await expect(itemOf(page, "pop_upMenu1", "Second")).toBeFocused();
            await page.keyboard.press("ArrowDown");
            await expect(itemOf(page, "pop_upMenu1", "Last")).toBeFocused();
            await page.keyboard.press("ArrowDown");
            await expect(itemOf(page, "pop_upMenu1", "First")).toBeFocused();
            await page.keyboard.press("End");
            await expect(itemOf(page, "pop_upMenu1", "Last")).toBeFocused();
            await page.keyboard.press("Home");
            await expect(itemOf(page, "pop_upMenu1", "First")).toBeFocused();
        });

        test("runs the item's action with Enter and closes the menu", async ({ page }) => {
            const trigger = page.locator(".mx-name-btnBasicTrigger");
            await trigger.focus();
            await trigger.press("Enter");
            await expect(itemOf(page, "pop_upMenu1", "First")).toBeFocused();

            await page.keyboard.press("Enter");

            await expect(dialog(page)).toBeVisible();
            await expect(menuOf(page, "pop_upMenu1")).toBeHidden();
        });

        test("keeps the menu open with Close on: Click outside when the action doesn't move focus", async ({
            page
        }) => {
            const trigger = page.locator(".mx-name-btnStayOpenTrigger");
            await trigger.focus();
            await trigger.press("Enter");
            const item = itemOf(page, "pop_upMenu2", "Stay Open");
            await expect(item).toBeFocused();

            await page.keyboard.press("Enter");

            await expect(menuOf(page, "pop_upMenu2")).toBeVisible();
            await expect(item).toBeFocused();
        });

        test("closes the menu with Close on: Click outside when the action opens a dialog (keyboard)", async ({
            page
        }) => {
            const trigger = page.locator(".mx-name-btnStayOpenTrigger");
            await trigger.focus();
            await trigger.press("Enter");
            await expect(itemOf(page, "pop_upMenu2", "Stay Open")).toBeFocused();
            await page.keyboard.press("ArrowDown");
            await expect(itemOf(page, "pop_upMenu2", "Opens dialog")).toBeFocused();

            await page.keyboard.press("Enter");

            await expect(dialog(page)).toBeVisible();
            await expect(menuOf(page, "pop_upMenu2")).toBeHidden();
        });

        test("closes the menu with Close on: Click outside when the action opens a dialog (mouse)", async ({
            page
        }) => {
            await page.locator(".mx-name-btnStayOpenTrigger").click();

            await itemOf(page, "pop_upMenu2", "Opens dialog").click();

            await expect(dialog(page)).toBeVisible();
            await expect(menuOf(page, "pop_upMenu2")).toBeHidden();
        });
    });

    test.describe("Tab", () => {
        test("closes the menu with Tab and moves focus past the widget", async ({ page }) => {
            const trigger = page.locator(".mx-name-btnBasicTrigger");
            await trigger.focus();
            await trigger.press("Enter");
            await expect(itemOf(page, "pop_upMenu1", "First")).toBeFocused();

            await page.keyboard.press("Tab");

            await expect(page.locator(".mx-name-btnAfter")).toBeFocused();
            await expect(menuOf(page, "pop_upMenu1")).toBeHidden();
        });

        test("closes the menu with Shift+Tab and returns focus to the trigger", async ({ page }) => {
            const trigger = page.locator(".mx-name-btnBasicTrigger");
            await trigger.focus();
            await trigger.press("Enter");
            await expect(itemOf(page, "pop_upMenu1", "First")).toBeFocused();

            await page.keyboard.press("Shift+Tab");

            await expect(trigger).toBeFocused();
            await expect(menuOf(page, "pop_upMenu1")).toBeHidden();
        });

        test("doesn't move focus when opened by hover, and Tab enters the menu", async ({ page }) => {
            const trigger = page.locator(".mx-name-btnHoverTrigger");
            await trigger.focus();

            await trigger.hover();
            await expect(menuOf(page, "pop_upMenu3")).toBeVisible();
            await expect(trigger).toBeFocused();

            await page.keyboard.press("Tab");
            await expect(itemOf(page, "pop_upMenu3", "Hover one")).toBeFocused();
        });
    });

    test.describe("submenus", () => {
        /** Opens the nested menu from the keyboard and focuses its first parent item. */
        async function openNested(page) {
            const trigger = page.locator(".mx-name-btnNestedTrigger");
            await trigger.focus();
            await trigger.press("Enter");
            const parentItem = itemOf(page, "pop_upMenu4", "Submenu A");
            await expect(parentItem).toBeFocused();
            // Nested menus are Mendix-rendered item content and link to their item once mounted.
            await expect(parentItem).toHaveAttribute("aria-haspopup", "menu");
            await expect(itemOf(page, "pop_upMenu4", "Submenu B")).toHaveAttribute("aria-haspopup", "menu");
            return trigger;
        }

        test("opens a submenu with ArrowRight and closes it with ArrowLeft", async ({ page }) => {
            await openNested(page);
            const parentItem = itemOf(page, "pop_upMenu4", "Submenu A");
            await expect(parentItem).toHaveAttribute("aria-expanded", "false");

            await page.keyboard.press("ArrowRight");
            await expect(itemOf(page, "popupSubA", "A one")).toBeFocused();
            await expect(parentItem).toHaveAttribute("aria-expanded", "true");

            await page.keyboard.press("ArrowLeft");
            await expect(menuOf(page, "popupSubA")).toBeHidden();
            await expect(parentItem).toBeFocused();
        });

        test("closes only the submenu with Escape", async ({ page }) => {
            await openNested(page);
            await page.keyboard.press("ArrowRight");
            await expect(itemOf(page, "popupSubA", "A one")).toBeFocused();

            await page.keyboard.press("Escape");

            await expect(menuOf(page, "popupSubA")).toBeHidden();
            await expect(menuOf(page, "pop_upMenu4")).toBeVisible();
            await expect(itemOf(page, "pop_upMenu4", "Submenu A")).toBeFocused();
        });

        test("opens a hover-mode submenu from the keyboard and closes the sibling submenu", async ({ page }) => {
            await openNested(page);
            await page.keyboard.press("ArrowRight");
            await expect(itemOf(page, "popupSubA", "A one")).toBeFocused();
            await page.keyboard.press("ArrowLeft");
            await expect(itemOf(page, "pop_upMenu4", "Submenu A")).toBeFocused();
            await page.keyboard.press("ArrowDown");
            await expect(itemOf(page, "pop_upMenu4", "Submenu B")).toBeFocused();

            await page.keyboard.press("Enter");

            await expect(itemOf(page, "popupSubB", "B one")).toBeFocused();
            await expect(menuOf(page, "popupSubA")).toBeHidden();
        });

        test("navigates only within the submenu", async ({ page }) => {
            await openNested(page);
            await page.keyboard.press("ArrowRight");
            await expect(itemOf(page, "popupSubA", "A one")).toBeFocused();

            await page.keyboard.press("ArrowDown");
            await expect(itemOf(page, "popupSubA", "A two")).toBeFocused();
            await page.keyboard.press("ArrowDown");
            await expect(itemOf(page, "popupSubA", "A one")).toBeFocused();
            await expect(itemOf(page, "pop_upMenu4", "Submenu A")).toHaveAttribute("tabindex", "0");
        });

        test("closes every level when a submenu item's action runs", async ({ page }) => {
            await openNested(page);
            await page.keyboard.press("ArrowRight");
            await expect(itemOf(page, "popupSubA", "A one")).toBeFocused();

            await page.keyboard.press("Enter");

            await expect(dialog(page)).toBeVisible();
            await expect(menuOf(page, "pop_upMenu4")).toBeHidden();
        });

        test("closes every level with Shift+Tab from a submenu and focuses the trigger", async ({ page }) => {
            const trigger = await openNested(page);
            await page.keyboard.press("ArrowRight");
            await expect(itemOf(page, "popupSubA", "A one")).toBeFocused();

            await page.keyboard.press("Shift+Tab");

            await expect(trigger).toBeFocused();
            await expect(menuOf(page, "pop_upMenu4")).toBeHidden();
        });

        test("runs a custom item's own action with Enter", async ({ page }) => {
            await openNested(page);
            await page.keyboard.press("End");
            await page.keyboard.press("ArrowUp");
            await expect(itemOf(page, "pop_upMenu4", "Leaf")).toBeFocused();

            await page.keyboard.press("Enter");

            await expect(dialog(page)).toBeVisible();
        });

        test("reaches a button inside a custom item with Tab, without closing", async ({ page }) => {
            await openNested(page);
            await page.keyboard.press("End");
            await expect(itemOf(page, "pop_upMenu4", "Inner button")).toBeFocused();

            await page.keyboard.press("Tab");

            await expect(page.locator(".mx-name-btnInsideItem")).toBeFocused();
            await expect(menuOf(page, "pop_upMenu4")).toBeVisible();
        });
    });

    test.describe("on a pop-up page", () => {
        test("closes only the menu with Escape, and the next Escape closes the page", async ({ page }) => {
            await page.locator(".mx-name-btnOpenPopupPage").click();
            const trigger = page.locator(".mx-name-btnPopupTrigger");
            await trigger.focus();
            await trigger.press("Enter");
            await expect(itemOf(page, "popupInPopup", "One")).toBeFocused();

            await page.keyboard.press("Escape");

            await expect(menuOf(page, "popupInPopup")).toBeHidden();
            await expect(dialog(page)).toBeVisible();
            await expect(trigger).toBeFocused();

            await page.keyboard.press("Escape");
            await expect(dialog(page)).toBeHidden();
        });
    });
});
