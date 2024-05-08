import { test, expect } from "@playwright/test";

test.describe("Range Slider", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
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
        await expect(page.locator(".mx-name-rangeSlider1 .rc-slider-handle")).toBeVisible();
        const handles = await page.locator(".mx-name-rangeSlider1 .rc-slider-handle").allInnerElements();
        const [lowerBound, upperBound] = handles;
        const lowerBoundSizes = await lowerBound.boundingBox();
        const upperBoundSizes = await upperBound.boundingBox();
        expect(upperBoundSizes.x).toBeGreaterThan(lowerBoundSizes.x);
    });
});
