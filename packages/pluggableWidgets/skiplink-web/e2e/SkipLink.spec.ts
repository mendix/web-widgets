import { expect, test } from "@playwright/test";

// Assumes the test project renders <SkipLink /> and a <main id="main-content"> element

test.describe("SkipLink", () => {
    test("should be hidden by default and visible on focus, and should skip to main content", async ({ page }) => {
        await page.goto("/");
        const skipLink = page.locator(".skip-link");
        // Should be hidden by default
        await expect(skipLink).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -120)");
        // Tab to focus the skip link
        await page.keyboard.press("Tab");
        await expect(skipLink).toBeVisible();
        // Check if skipLink is the active element
        const isFocused = await skipLink.evaluate(node => node === document.activeElement);
        expect(isFocused).toBe(true);
        // Press Enter to activate the link
        await page.keyboard.press("Enter");
        // The main content should be focused or scrolled into view
        const main = page.locator("#main-content");
        await expect(main).toBeVisible();
    });
});
