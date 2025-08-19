import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("checkbox-radio-selection-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/checkboxradioselection");
        await page.waitForLoadState("networkidle");
        await page.click(".mx-name-actionButton1");
    });

    test.describe("data source types", () => {
        test("renders checkbox radio selection using association", async ({ page }) => {
            const selectionControls = page.locator(".mx-name-checkboxRadioSelection1");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`checkboxRadioSelectionAssociation.png`);
        });

        test("renders checkbox radio selection using enum", async ({ page }) => {
            const selectionControls = page.locator(".mx-name-checkboxRadioSelection2");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`checkboxRadioSelectionEnum.png`);
        });

        test("renders checkbox radio selection using boolean", async ({ page }) => {
            const selectionControls = page.locator(".mx-name-checkboxRadioSelection3");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`checkboxRadioSelectionBoolean.png`);
        });

        test("renders checkbox radio selection using static values", async ({ page }) => {
            await page.reload();
            await page.click(".mx-name-actionButton1", { timeout: 10000 });
            await page.waitForLoadState("networkidle", { timeout: 10000 });
            const tabPage2 = page.getByRole("tab", { name: "Page 2" });
            await expect(tabPage2).toBeVisible({ timeout: 10000 });
            await tabPage2.click();
            const selectionControls = page.locator(".mx-name-checkboxRadioSelection4");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`checkboxRadioSelectionStatic.png`);
        });

        test("renders checkbox radio selection using database", async ({ page }) => {
            await page.reload();
            await page.click(".mx-name-actionButton1", { timeout: 10000 });
            await page.waitForLoadState("networkidle", { timeout: 10000 });
            const tabPage2 = page.getByRole("tab", { name: "Page 2" });
            await expect(tabPage2).toBeVisible({ timeout: 10000 });
            await tabPage2.click();
            const selectionControls = page.locator(".mx-name-checkboxRadioSelection5");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`checkboxRadioSelectionDatabase.png`);
        });

        test.describe("selection behavior", () => {
            test("handles radio button selection", async ({ page }) => {
                await page.reload();
                await page.click(".mx-name-actionButton1", { timeout: 10000 });
                await page.waitForLoadState("networkidle", { timeout: 10000 });
                const tabPage2 = page.getByRole("tab", { name: "Page 2" });
                await expect(tabPage2).toBeVisible({ timeout: 10000 });
                await tabPage2.click();
                const selectionControls = page.locator(".mx-name-checkboxRadioSelection5");
                await expect(selectionControls).toBeVisible({ timeout: 10000 });

                const radioOption = selectionControls.locator('input[type="radio"]').first();
                await radioOption.click();
                await expect(radioOption).toBeChecked();
            });

            test("handles checkbox selection", async ({ page }) => {
                const selectionControls = page.locator(".mx-name-checkboxRadioSelection1"); // multi selection
                await expect(selectionControls).toBeVisible({ timeout: 10000 });

                const checkboxOption = selectionControls.locator('input[type="checkbox"]').first();
                await checkboxOption.click();
                await expect(checkboxOption).toBeChecked();
            });
        });
    });
});
