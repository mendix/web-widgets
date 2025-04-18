import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("column-chart-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        // Disable CSS animations and transitions for stability
        await page.addStyleTag({ content: `* { transition: none !important; animation: none !important; }` });
        // Wait for all fonts to be loaded
        await page.evaluate(async () => {
            if (typeof document !== "undefined" && document.fonts) {
                await document.fonts.ready;
            }
        });
    });

    async function stableScreenshot(locator, screenshotName) {
        await locator.scrollIntoViewIfNeeded();
        await expect(locator).toBeVisible({ timeout: 10000 });
        // Wait for all images to load
        await locator.evaluate(async el => {
            const images = el.querySelectorAll("img");
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) {
                        return Promise.resolve();
                    }
                    return new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    });
                })
            );
        });
        // Add a short delay to ensure rendering is complete
        await locator.page().waitForTimeout(200);
        await expect(locator).toHaveScreenshot(screenshotName, {
            animations: "disabled",
            fullPage: false
        });
    }

    test.describe("column color", () => {
        test("renders column chart with default color and compares with a screenshot baseline", async ({ page }) => {
            const defaultColorContainer = page.locator(".mx-name-containerDefaultColor");
            await stableScreenshot(defaultColorContainer, `columnChartDefaultColor.png`);
        });

        test("renders column chart with custom color and compares with a screenshot baseline", async ({ page }) => {
            const customColorContainer = page.locator(".mx-name-containerCustomColor");
            await stableScreenshot(customColorContainer, `columnChartCustomColor.png`);
        });
    });

    test.describe("column format", () => {
        test("renders column chart with grouped format and compares with a screenshot baseline", async ({ page }) => {
            const groupContainer = page.locator(".mx-name-containerGroup");
            await stableScreenshot(groupContainer, `columnChartGrouped.png`);
        });

        test("renders column chart with stacked format and compares with a screenshot baseline", async ({ page }) => {
            const stackContainer = page.locator(".mx-name-containerStack");
            await stableScreenshot(stackContainer, `columnChartStacked.png`);
        });
    });
});
