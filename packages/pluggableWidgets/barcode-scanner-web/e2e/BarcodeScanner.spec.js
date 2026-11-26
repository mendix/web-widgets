import { test, expect } from "@mendix/run-e2e/fixtures";

// The fake camera (see playwright.config.cjs) shows a Code 128 barcode with the value "MX-E2E-42".
test.describe("barcode-scanner-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("shows the camera stream with the barcode mask", async ({ page }) => {
        const scanner = page.locator(".mx-name-barcodeScannerAll");

        await expect(scanner.locator("video")).toBeVisible();
        await expect(scanner.locator(".video-canvas .canvas-middle-middle")).toBeVisible();
        await expect(page.locator(".mx-name-barcodeScannerQrOnly video")).toBeVisible();
        await expect(page.locator(".mx-name-barcodeScannerQrOnly .video-canvas")).toHaveCount(0);
    });

    test("stores the scanned value and runs the detect action once", async ({ page }) => {
        await expect(page.locator(".mx-name-textStateAll")).toHaveText("Result: MX-E2E-42, detected 1 times", {
            timeout: 15_000
        });
    });

    test("ignores barcodes of formats that are not enabled", async ({ page }) => {
        // Both scanners see the same camera; once one has read the Code 128 barcode, the QR only one has seen it too.
        await expect(page.locator(".mx-name-textStateAll")).toContainText("MX-E2E-42", { timeout: 15_000 });

        await expect(page.locator(".mx-name-textStateQrOnly")).toHaveText("Result: , detected 0 times");
    });
});
