import { expect, test } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("combobox-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await waitForMendixApp(page);
        await page.click(".mx-name-actionButton1");
        await waitForMendixApp(page);
    });

    test.describe("data source types", () => {
        test("renders combobox using association", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox1");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxAssociation.png`);
            await comboBox.click();
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxAssociationOpen.png`
            );
        });

        test("renders combobox using association and row click selection mode", async ({ page }) => {
            await page.click(".mx-name-tabPage2");
            const comboBox = page.locator(".mx-name-comboBox4");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxAssociationRowClick.png`);
            await comboBox.click();
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxAssociationRowClickOpen.png`
            );
        });

        test("renders combobox using enum", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox2");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxEnum.png`);
            await comboBox.click();
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxEnumOpen.png`
            );
        });

        test("renders combobox using enum and footer", async ({ page }) => {
            await page.click(".mx-name-tabPage2");
            const comboBox = page.locator(".mx-name-comboBox5");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await comboBox.click();
            await expect(page.locator(".mx-name-comboBox5 .widget-combobox-menu").first()).toHaveScreenshot(
                `comboBoxEnumFooter.png`
            );
        });

        test("renders combobox read only", async ({ page }) => {
            await page.click(".mx-name-tabPage2");
            const comboBox = page.locator(".mx-name-comboBox6");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await comboBox.click();
            await expect(comboBox).toHaveScreenshot(`comboBoxReadOnly.png`);
        });

        test("renders combobox using boolean", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox3");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxBoolean.png`);
            await comboBox.click();
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxBooleanOpen.png`
            );
        });

        test("renders combobox using static values", async ({ page }) => {
            await page.click(".mx-name-tabPage3");
            const comboBox = page.locator(".mx-name-comboBox7");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxStatic.png`);
            await comboBox.click();
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxStaticOpen.png`
            );
        });

        test("renders combobox using database", async ({ page }) => {
            await page.click(".mx-name-tabPage3");
            const comboBox = page.locator(".mx-name-comboBox8");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxDatabase.png`);
            await comboBox.click();
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxDatabaseOpen.png`
            );
        });
        test.describe("searching and selecting", () => {
            test("renders a filter result", async ({ page }) => {
                const comboBox = page.locator(".mx-name-comboBox2");
                await expect(comboBox).toBeVisible({ timeout: 10000 });
                await comboBox.click();
                await getFilterInput(comboBox).fill("A");
                await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                    `comboBoxFiltering.png`
                );
            });

            test("renders combobox removing a selected value", async ({ page }) => {
                await page.click(".mx-name-tabPage2");
                const comboBox = page.locator(".mx-name-comboBox4");
                await expect(comboBox).toBeVisible({ timeout: 10000 });
                await comboBox.locator(".widget-combobox-icon-container").first().click();
                await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                    `comboBoxRemoveSelection.png`
                );
            });

            test("renders combobox removing all selected value", async ({ page }) => {
                await page.click(".mx-name-tabPage2");
                const comboBox = page.locator(".mx-name-comboBox4");
                await expect(comboBox).toBeVisible({ timeout: 10000 });
                await comboBox.locator(".widget-combobox-clear-button").nth(3).click();
                await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                    `comboBoxRemoveAllSelection.png`
                );
            });
        });
    });

    test.describe("searching and selecting", () => {
        test("clears with backspace", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox2");
            await expect(comboBox).toBeVisible({ timeout: 10000 });

            // check nothing is selected
            await expect(getSelectedText(comboBox)).toContainClass("widget-combobox-placeholder-empty");

            // open the dropdown
            await page.click(".mx-name-comboBox2");

            // select europe
            await getOptionItem(comboBox, "Europe").click({ delay: 10 });
            await expect(getSelectedText(comboBox)).toContainText("Europe");

            // check input stays focused
            await expect(getFilterInput(comboBox)).toBeFocused();

            // press Backspace to clear
            await page.keyboard.press("Backspace");

            // check if cleared
            await expect(getSelectedText(comboBox)).toContainClass("widget-combobox-placeholder-empty");
        });

        test("types filter when selected", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox2");
            await expect(comboBox).toBeVisible({ timeout: 10000 });

            // check nothing is selected
            await expect(getSelectedText(comboBox)).toContainClass("widget-combobox-placeholder-empty");

            // open the dropdown
            await page.click(".mx-name-comboBox2");

            // select europe
            await getOptionItem(comboBox, "Europe").click({ delay: 10 });
            await expect(getSelectedText(comboBox)).toContainText("Europe");

            // check input stays focused
            await expect(getFilterInput(comboBox)).toBeFocused();

            // type filter text
            await page.keyboard.type("aaa");

            // check if filtered
            await expect(getOptions(comboBox)).toHaveText(["Antartica", "Australia"]);
        });

        test("menu list not in DOM when closed, present when opened", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox1");
            await expect(comboBox).toBeVisible({ timeout: 10000 });

            // Verify menu list is not in DOM when closed
            const menuListClosed = comboBox.locator(".widget-combobox-menu-list");
            await expect(menuListClosed).not.toBeVisible();

            // Open the combobox
            await comboBox.click();

            // Verify menu list is now in DOM and visible
            const menuListOpen = comboBox.locator(".widget-combobox-menu-list");
            await expect(menuListOpen).toBeVisible();
            await expect(getOptions(comboBox).first()).toBeVisible();
        });
    });

    test.describe("menu positioning (floating-ui)", () => {
        // Regression for WC-3406: the menu used to flip between above/below the input
        // and jump when its content height changed. It must now settle in one place and,
        // when space is tight, shrink + scroll within the viewport instead of overflowing.

        test("menu does not jump (top stays stable) while open", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox2");
            await expect(comboBox).toBeVisible({ timeout: 10000 });

            await comboBox.click();
            const menu = page.locator(".mx-name-comboBox2 .widget-combobox-menu").first();
            await expect(menu).toBeVisible();

            // Wait for floating-ui to complete its first positioning pass. useFloatingMenu keeps the
            // menu visibility:hidden until isPositioned is true, so this is a precise, web-first gate.
            await expect(menu).not.toHaveCSS("visibility", "hidden");

            // Sample the top across several reads in the same batch — no sleep needed.
            const readTop = () => menu.evaluate(el => el.getBoundingClientRect().top);
            const first = await readTop();
            const samples = await Promise.all([readTop(), readTop(), readTop(), readTop(), readTop()]);

            // No oscillation: every later sample equals the first (sub-pixel tolerance).
            for (const top of samples) {
                expect(Math.abs(top - first)).toBeLessThanOrEqual(1);
            }
        });

        test("menu shrinks and stays within the viewport when space is tight", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox2");
            await expect(comboBox).toBeVisible({ timeout: 10000 });

            // Shrink the viewport so there is little room below the input, forcing the
            // size() middleware to cap the menu height.
            await page.setViewportSize({ width: 1024, height: 360 });

            await comboBox.click();
            const menu = page.locator(".mx-name-comboBox2 .widget-combobox-menu").first();
            await expect(menu).toBeVisible();

            const box = await menu.boundingBox();
            const viewport = page.viewportSize();

            // Menu bottom stays on screen (respecting the 8px viewport padding).
            expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
            // Menu height is capped below the 320px default because space is limited.
            expect(box.height).toBeLessThan(320);
        });

        test("menu width matches the input width", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox2");
            await expect(comboBox).toBeVisible({ timeout: 10000 });

            const inputContainer = comboBox.locator(".widget-combobox-input-container").first();
            await comboBox.click();
            const menu = page.locator(".mx-name-comboBox2 .widget-combobox-menu").first();
            await expect(menu).toBeVisible();

            const inputBox = await inputContainer.boundingBox();
            const menuBox = await menu.boundingBox();

            expect(Math.abs(menuBox.width - inputBox.width)).toBeLessThanOrEqual(1);
        });
    });
});

function getOptions(combobox) {
    return combobox.locator(`[role=listbox] [role=option]`);
}

function getOptionItem(combobox, text) {
    return combobox.locator(`[role=listbox] [role=option]:has-text("${text}")`);
}

function getSelectedText(combobox) {
    return combobox.locator(".widget-combobox-placeholder-text");
}

function getFilterInput(combobox) {
    return combobox.locator("input");
}
