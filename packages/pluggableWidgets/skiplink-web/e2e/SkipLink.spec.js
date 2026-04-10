import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Wait for the skip link to be attached to the DOM
    await page.locator(".widget-skip-link").first().waitFor({ state: "attached" });
});

test.describe("SkipLink:", function () {
    test("skip link is present in DOM but initially hidden", async ({ page }) => {
        // Skip link should be in the DOM but not visible
        const skipLink = page.locator(".widget-skip-link").first();
        await expect(skipLink).toBeAttached();

        // Check initial styling (hidden) - transform is on the container, not the link
        const container = page.locator(".widget-skip-link-container");
        const transform = await container.evaluate(el => getComputedStyle(el).transform);
        // Check for translateY(-120%) which appears as negative Y value in matrix
        expect(transform).toMatch(/matrix.*-\d+/);
    });

    test("skip link becomes visible when focused via keyboard", async ({ page }) => {
        // Tab to focus the skip link (should be first focusable element)
        const skipLink = page.locator(".widget-skip-link").first();
        await page.keyboard.press("Tab");

        await expect(skipLink).toBeFocused();
        
        // Wait for the CSS transition to complete (0.2s in CSS + buffer)
        await page.waitForTimeout(300);
        
        // Check that the container becomes visible when focused
        const container = page.locator(".widget-skip-link-container");
        const transform = await container.evaluate(el => getComputedStyle(el).transform);
        // When focused, translateY(0) results in matrix(1, 0, 0, 1, 0, 0)
        expect(transform).toContain("matrix(1, 0, 0, 1, 0, 0)");
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
