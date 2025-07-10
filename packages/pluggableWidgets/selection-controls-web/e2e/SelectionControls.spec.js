import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("selection-controls-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/selectioncontrols");
        await page.waitForLoadState("networkidle");
    });

    test.describe("data source types", () => {
        test("renders selection controls using association", async ({ page }) => {
            const selectionControls = page.locator(".mx-name-selectionControls1");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`selectionControlsAssociation.png`);
        });

        test("renders selection controls using enum", async ({ page }) => {
            const selectionControls = page.locator(".mx-name-selectionControls2");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`selectionControlsEnum.png`);
        });

        test("renders selection controls using boolean", async ({ page }) => {
            const selectionControls = page.locator(".mx-name-selectionControls3");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`selectionControlsBoolean.png`);
        });

        test("renders selection controls using static values", async ({ page }) => {
            const selectionControls = page.locator(".mx-name-selectionControls4");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`selectionControlsStatic.png`);
        });

        test("renders selection controls using database", async ({ page }) => {
            const selectionControls = page.locator(".mx-name-selectionControls5");
            await expect(selectionControls).toBeVisible({ timeout: 10000 });
            await expect(selectionControls).toHaveScreenshot(`selectionControlsDatabase.png`);
        });

        test.describe("selection behavior", () => {
            test("handles radio button selection", async ({ page }) => {
                const selectionControls = page.locator(".mx-name-selectionControls1");
                await expect(selectionControls).toBeVisible({ timeout: 10000 });

                const radioOption = selectionControls.locator('input[type="radio"]').first();
                await radioOption.click();
                await expect(radioOption).toBeChecked();
            });

            test("handles checkbox selection", async ({ page }) => {
                const selectionControls = page.locator(".mx-name-selectionControls6"); // multi selection
                await expect(selectionControls).toBeVisible({ timeout: 10000 });

                const checkboxOption = selectionControls.locator('input[type="checkbox"]').first();
                await checkboxOption.click();
                await expect(checkboxOption).toBeChecked();
            });
        });
    });
});
