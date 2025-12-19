import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
});

test.describe("SkipLink:", function () {
    test("skip link is present in DOM but initially hidden", async ({ page }) => {
        // Skip link should be in the DOM but not visible
        const skipLink = page.locator(".widget-skip-link").first();
        await expect(skipLink).toBeAttached();
        
        // Check initial styling (hidden)
        const transform = await skipLink.evaluate(el => getComputedStyle(el).transform);
        expect(transform).toContain("matrix(1, 0, 0, 1, 0, -48)");
    });

    test("skip link becomes visible when focused via keyboard", async ({ page }) => {
        // Tab to focus the skip link (should be first focusable element)
        const skipLink = page.locator(".widget-skip-link").first();
        await page.keyboard.press("Tab");
        
        await expect(skipLink).toBeFocused();
        await page.waitForTimeout(1000);
        // Check that it becomes visible when focused
        const transform = await skipLink.evaluate(el => getComputedStyle(el).transform);
        expect(transform).toContain("matrix(1, 0, 0, 1, 0, 0)")
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