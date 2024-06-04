import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Range Slider", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("renders slider with interval context", async ({ page }) => {
        await expect(page.locator(".mx-name-rangeSlider1 .rc-slider-track.rc-slider-track-1")).toBeVisible();
    });

    test("renders slider min value text", async ({ page }) => {
        await expect(page.locator(".mx-name-rangeSlider1 .rc-slider-mark-text").first()).toHaveText("0");
    });

    test("renders slider max value text", async ({ page }) => {
        await expect(page.locator(".mx-name-rangeSlider1 .rc-slider-mark-text").nth(1)).toHaveText("100");
    });

    test("upper bound value is higher than lower bound value", async ({ page }) => {
        await expect(page.locator(".mx-name-rangeSlider1")).toBeVisible();
        await expect(page.locator(".mx-name-rangeSlider1 .rc-slider-handle").first()).toBeVisible();
        const handles = await page.locator(".mx-name-rangeSlider1 .rc-slider-handle").all();
        const [lowerBound, upperBound] = handles;
        const lowerBoundSizes = await lowerBound.boundingBox();
        const upperBoundSizes = await upperBound.boundingBox();
        expect(upperBoundSizes.x).toBeGreaterThan(lowerBoundSizes.x);
    });
});
