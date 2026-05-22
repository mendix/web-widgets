import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForMendixApp(page);
    // Establish focus context so keyboard events are delivered
    await page.locator("body").click();
});

test.describe("SkipLink:", function () {
    test("skip link is present in DOM but initially hidden", async ({ page }) => {
        const skipLink = page.locator(".widget-skip-link").first();
        await expect(skipLink).toBeAttached();

        await expect(skipLink).not.toBeInViewport();
    });

    test("skip link becomes visible when focused via keyboard", async ({ page }) => {
        const skipLink = page.locator(".widget-skip-link").first();
        await page.keyboard.press("Tab");

        await expect(skipLink).toBeFocused();
        await expect(skipLink).toBeInViewport();
    });

    test("skip link navigates to main content when activated", async ({ page }) => {
        // Tab to focus the skip link
        await page.keyboard.press("Tab");

        const skipLink = page.locator(".widget-skip-link").first();
        await expect(skipLink).toBeFocused();

        // Activate the skip link
        await page.keyboard.press("Enter");

        // Check that main content is now focused
        const mainContent = page.locator("main");
        await expect(mainContent).toBeFocused();
    });

    test("skip link has correct attributes and text", async ({ page }) => {
        const skipLink = page.locator(".widget-skip-link").first();

        // Check default text
        await expect(skipLink).toHaveText("Skip to main content");

        // Check href attribute
        await expect(skipLink).toHaveAttribute("href", "#");

        // Check CSS class
        await expect(skipLink).toHaveClass("widget-skip-link mx-name-skipLink1");
    });

    test("visual comparison", async ({ page }) => {
        // Tab to make skip link visible for screenshot
        await page.keyboard.press("Tab");

        const skipLink = page.locator(".widget-skip-link").first();
        await expect(skipLink).toBeFocused();

        // Visual comparison of focused skip link
        await expect(skipLink).toHaveScreenshot("skiplink-focused.png");
    });
});
