import { test, expect } from "@playwright/test";

test.describe("Popup-menu-web", () => {
    test.describe("using basic option", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("index.html");
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the top left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton10");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuTopLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton12");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the top position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton15");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuTop.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the top right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton13");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuTopRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton14");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the bottom right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton20");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuBottomRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the bottom left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton18");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuBottomLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if popupmenu is rendered in the bottom position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton19");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`popUpMenuBottom.png`, { threshold: 0.1 });
        });

        test("shows a new menu list when on hover is triggered", async ({ page }) => {
            await page.click(".mx-name-actionButton1");
            const button25 = await page.$(".mx-name-actionButton25");
            await expect(button25).toBeVisible();
            await button25.hover();
            const text42 = await page.$(".mx-name-text42");
            await text42.hover();
            await expect(text42).toContainText("Gooooooo");
        });

        test("shows a message when one item is clicked", async ({ page }) => {
            const button10 = await page.$(".mx-name-actionButton10");
            await expect(button10).toBeVisible();
            await button10.click();
            const popupPortal = await page.$(".popup-portal");
            const firstItem = await popupPortal.$(".popupmenu-basic-item");
            await firstItem.click();
            const modalDialog = await page.$(".modal-dialog");
            await expect(modalDialog).toBeVisible();
            await expect(modalDialog).toContainText("hello");
        });
    });
    test.describe("using custom option", () => {
        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the top left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton11");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuTopLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the left position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton17");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`CustomPopUpMenuLeft.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the top position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton24");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuTop.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the top right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton23");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuTopRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the right position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton26");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuRight.png`, { threshold: 0.1 });
        });

        test("compares with a screenshot baseline and checks if custom popupmenu is rendered in the bottom position", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton29");
            const container = await page.$(".mx-name-container15");
            await expect(container).toHaveScreenshot(`customPopUpMenuBottom.png`, { threshold: 0.1 });
        });

        test("shows a message when one item is clicked", async ({ page }) => {
            await page.click(".mx-name-actionButton11");
            const popupPortal = await page.$(".popup-portal");
            await expect(popupPortal).toBeVisible();
            const firstItem = await popupPortal.$(".mx-name-text35");
            await firstItem.click();
            const modalDialog = await page.$(".modal-dialog");
            await expect(modalDialog).toBeVisible();
            const modalText = await modalDialog.textContent();
            await expect(modalText).toContain("hello");
        });
    });
});
