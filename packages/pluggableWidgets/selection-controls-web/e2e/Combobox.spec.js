import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("combobox-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/combobox");
        await page.waitForLoadState("networkidle");
        await page.click(".mx-name-actionButton1");
    });

    test.describe("data source types", () => {
        test("renders combobox using association", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox1");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxAssociation.png`);
            await page.click(".mx-name-comboBox1");
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxAssociationOpen.png`
            );
        });

        test("renders combobox using association and row click selection mode", async ({ page }) => {
            await page.click(".mx-name-tabPage2");
            const comboBox = page.locator(".mx-name-comboBox4");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxAssociationRowClick.png`);
            await page.click(".mx-name-comboBox4");
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxAssociationRowClickOpen.png`
            );
        });

        test("renders combobox using enum", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox2");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxEnum.png`);
            await page.click(".mx-name-comboBox2");
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxEnumOpen.png`
            );
        });

        test("renders combobox using enum and footer", async ({ page }) => {
            await page.click(".mx-name-tabPage2");
            const comboBox = page.locator(".mx-name-comboBox5");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await page.click(".mx-name-comboBox5");
            await expect(page.locator(".mx-name-comboBox5 .widget-combobox-menu").first()).toHaveScreenshot(
                `comboBoxEnumFooter.png`
            );
        });

        test("renders combobox read only", async ({ page }) => {
            await page.click(".mx-name-tabPage2");
            const comboBox = page.locator(".mx-name-comboBox6");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await page.click(".mx-name-comboBox6");
            await expect(comboBox).toHaveScreenshot(`comboBoxReadOnly.png`);
        });

        test("renders combobox using boolean", async ({ page }) => {
            const comboBox = page.locator(".mx-name-comboBox3");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxBoolean.png`);
            await page.click(".mx-name-comboBox3");
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxBooleanOpen.png`
            );
        });

        test("renders combobox using static values", async ({ page }) => {
            await page.click(".mx-name-tabPage3");
            const comboBox = page.locator(".mx-name-comboBox7");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxStatic.png`);
            await page.click(".mx-name-comboBox7");
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxStaticOpen.png`
            );
        });

        test("renders combobox using database", async ({ page }) => {
            await page.click(".mx-name-tabPage3");
            const comboBox = page.locator(".mx-name-comboBox8");
            await expect(comboBox).toBeVisible({ timeout: 10000 });
            await expect(comboBox).toHaveScreenshot(`comboBoxDatabase.png`);
            await page.click(".mx-name-comboBox8");
            await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                `comboBoxDatabaseOpen.png`
            );
        });
        test.describe("searching and selecting", () => {
            test("renders a filter result", async ({ page }) => {
                const comboBox = page.locator(".mx-name-comboBox2");
                await expect(comboBox).toBeVisible({ timeout: 10000 });
                await page.click(".mx-name-comboBox2");
                await page.locator(".mx-name-comboBox2 .widget-combobox-input").fill("A");
                await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                    `comboBoxFiltering.png`
                );
            });

            test("renders combobox removing a selected value", async ({ page }) => {
                await page.click(".mx-name-tabPage2");
                const comboBox = page.locator(".mx-name-comboBox4");
                await expect(comboBox).toBeVisible({ timeout: 10000 });
                await page.locator(".mx-name-comboBox4 .widget-combobox-icon-container").first().click();
                await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                    `comboBoxRemoveSelection.png`
                );
            });

            test("renders combobox removing all selected value", async ({ page }) => {
                await page.click(".mx-name-tabPage2");
                const comboBox = page.locator(".mx-name-comboBox4");
                await expect(comboBox).toBeVisible({ timeout: 10000 });
                await page.locator(".mx-name-comboBox4 .widget-combobox-clear-button").nth(3).click();
                await expect(page.locator(".modal-body .mx-name-layoutGrid1").first()).toHaveScreenshot(
                    `comboBoxRemoveAllSelection.png`
                );
            });
        });
    });
});
