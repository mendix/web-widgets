import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("column-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test.describe("column color", () => {
        test("renders column chart with default color and compares with a screenshot baseline", async ({ page }) => {
            const defaultColorContainer = page.locator(".mx-name-containerDefaultColor");
            await defaultColorContainer.scrollIntoViewIfNeeded();
            await expect(defaultColorContainer).toBeVisible({ timeout: 10000 });
            await expect(defaultColorContainer).toHaveScreenshot(`columnChartDefaultColor.png`);
        });

        test("renders column chart with custom color and compares with a screenshot baseline", async ({ page }) => {
            const customColorContainer = page.locator(".mx-name-containerCustomColor");
            await customColorContainer.scrollIntoViewIfNeeded();
            await expect(customColorContainer).toBeVisible({ timeout: 10000 });
            await expect(customColorContainer).toHaveScreenshot(`columnChartCustomColor.png`);
        });
    });

    test.describe("column format", () => {
        test("renders column chart with grouped format and compares with a screenshot baseline", async ({ page }) => {
            const groupContainer = page.locator(".mx-name-containerGroup");
            await groupContainer.scrollIntoViewIfNeeded();
            await expect(groupContainer).toBeVisible({ timeout: 10000 });
            await expect(groupContainer).toHaveScreenshot(`columnChartGrouped.png`);
        });

        test("renders column chart with stacked format and compares with a screenshot baseline", async ({ page }) => {
            const stackContainer = page.locator(".mx-name-containerStack");
            await stackContainer.scrollIntoViewIfNeeded();
            await expect(stackContainer).toBeVisible({ timeout: 10000 });
            await expect(stackContainer).toHaveScreenshot(`columnChartStacked.png`);
        });
    });
});
