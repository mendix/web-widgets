import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("BarcodeGenerator", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("renders barcode generator widget", async ({ page }) => {
        // TODO: Replace with actual barcode generator test when implementation is complete
        // Example test structure for barcode generator:
        // await expect(page.locator(".mx-name-barcodeGenerator").first()).toBeVisible();
        // await page.locator(".mx-name-textInput").fill("Test QR Code");
        // await expect(page.locator(".mx-name-barcodeGenerator canvas")).toBeVisible();

        // Placeholder test for now
        await expect(page.locator("body")).toBeVisible();
    });
});
