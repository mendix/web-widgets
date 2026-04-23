import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Popup-menu-web", () => {
    test.describe("using basic option", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the top left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton10");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuTopLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton12");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the top position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton15");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuTop.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the top right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton13");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuTopRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton14");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the bottom right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton20");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuBottomRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the bottom left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton18");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuBottomLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the bottom position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton19");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuBottom.png`, { threshold: 0.1 });
        });

        test("shows a new menu list when on hover is triggered", async ({ page }) => {
            await page.click(".mx-name-actionButton1");
            await page.waitForLoadState("networkidle");
            const button25 = page.getByRole("button", { name: "Trigger On Hover" });
            await expect(button25).toBeVisible();
            await button25.hover();
            const text42 = await page.locator(".mx-name-text42");
            await text42.hover();
            await expect(text42).toContainText("Gooooooo");
        });

        test("shows a message when one item is clicked", async ({ page }) => {
            const button10 = await page.locator(".mx-name-actionButton10");
            await expect(button10).toBeVisible();
            await button10.click();
            const popupPortal = await page.locator(".mx-name-pop_upMenu18");
            const firstItem = await popupPortal.locator(".popupmenu-basic-item");
            await firstItem.first().click();
            const modalDialog = await page.locator(".modal-dialog");
            await expect(modalDialog).toBeVisible();
            await expect(modalDialog).toContainText("hello");
        });

        test("navigates menu items with arrow keys", async ({ page }) => {
            // Open the menu
            const button10 = await page.locator(".mx-name-actionButton10");
            await expect(button10).toBeVisible();
            await button10.click();

            const popupPortal = await page.locator(".mx-name-pop_upMenu18");
            await expect(popupPortal).toBeVisible();

            const menuItems = await popupPortal.locator(".popupmenu-basic-item").all();
            expect(menuItems.length).toBeGreaterThan(0);

            // First item should have focus initially (tabindex="0")
            await expect(menuItems[0]).toHaveAttribute("tabindex", "0");

            // Press ArrowDown to move to next item
            await page.keyboard.press("ArrowDown");
            await expect(menuItems[0]).toHaveAttribute("tabindex", "-1");
            await expect(menuItems[1]).toHaveAttribute("tabindex", "0");

            // Press ArrowDown again
            await page.keyboard.press("ArrowDown");
            await expect(menuItems[1]).toHaveAttribute("tabindex", "-1");
            await expect(menuItems[2]).toHaveAttribute("tabindex", "0");

            // Press ArrowUp to go back
            await page.keyboard.press("ArrowUp");
            await expect(menuItems[2]).toHaveAttribute("tabindex", "-1");
            await expect(menuItems[1]).toHaveAttribute("tabindex", "0");

            // Test loop behavior: navigate to last item then press ArrowDown to wrap to first
            const lastIndex = menuItems.length - 1;
            for (let i = 1; i < lastIndex; i++) {
                await page.keyboard.press("ArrowDown");
            }
            await expect(menuItems[lastIndex]).toHaveAttribute("tabindex", "0");

            // Press ArrowDown to wrap to first item
            await page.keyboard.press("ArrowDown");
            await expect(menuItems[lastIndex]).toHaveAttribute("tabindex", "-1");
            await expect(menuItems[0]).toHaveAttribute("tabindex", "0");

            // Test reverse loop: press ArrowUp to wrap to last item
            await page.keyboard.press("ArrowUp");
            await expect(menuItems[0]).toHaveAttribute("tabindex", "-1");
            await expect(menuItems[lastIndex]).toHaveAttribute("tabindex", "0");
        });

        test("activates menu item with Enter key after arrow navigation", async ({ page }) => {
            // Open the menu
            const button10 = await page.locator(".mx-name-actionButton10");
            await button10.click();

            const popupPortal = await page.locator(".mx-name-pop_upMenu18");
            await expect(popupPortal).toBeVisible();

            // Stay on first item (which we know triggers a modal based on existing test)
            const firstItem = await popupPortal.locator(".popupmenu-basic-item").first();

            // Activate with Enter
            await page.keyboard.press("Enter");

            // Verify action was triggered - first item shows "hello" modal
            const modalDialog = await page.locator(".modal-dialog");
            await expect(modalDialog).toBeVisible();
            await expect(modalDialog).toContainText("hello");
        });
    });
    test.describe("using custom option", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the top left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton11");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuTopLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton17");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`CustomPopUpMenuLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the top position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton24");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuTop.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the top right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton23");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuTopRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton26");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the bottom position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton29");
            const container = await page.locator(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuBottom.png`, { threshold: 0.1 });
        });

        test("shows a message when one item is clicked", async ({ page }) => {
            await page.click(".mx-name-actionButton11");
            const popupPortal = await page.locator(".mx-name-pop_upMenu13");
            await expect(popupPortal).toBeVisible();
            const firstItem = await popupPortal.locator(".mx-name-text35");
            await firstItem.first().click();
            const modalDialog = await page.locator(".modal-dialog");
            await expect(modalDialog).toBeVisible();
            const modalText = await modalDialog.textContent();
            await expect(modalText).toContain("hello");
        });
    });
});
