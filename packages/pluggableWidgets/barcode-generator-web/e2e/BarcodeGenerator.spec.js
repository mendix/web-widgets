import { test, expect } from "@mendix/run-e2e/fixtures";

/**
 * These tests are dormant until the test project exists: `package.json` still has
 * `"e2e": "echo ..."` because https://github.com/mendix/testProjects has no
 * `barcode-generator-web` branch yet (only `barcode-scanner-web`).
 *
 * To enable, create that branch with a `/p/datamatrix` page containing:
 *   - dataMatrixPlain        Data Matrix, GS1 off, square, value "ABC-12345"
 *   - dataMatrixGs1          Data Matrix, GS1 on, value "(01)09501101020917(17)261231(10)ABC123"
 *   - dataMatrixRectangle    Data Matrix, shape Rectangle
 *   - dataMatrixDownload     Data Matrix with "Allow download" on, file name "datamatrix"
 *   - textBoxCodeValue       text box bound to the attribute dataMatrixBound reads from
 *   - dataMatrixBound        Data Matrix bound to that attribute
 * then swap the `e2e` script to `run-e2e ci`.
 */
test.describe("BarcodeGenerator", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/datamatrix");
    });

    test("renders a Data Matrix symbol as inline SVG @smoke", async ({ page }) => {
        const symbol = page.locator(".mx-name-dataMatrixPlain .datamatrix-svg svg");

        await expect(symbol).toBeVisible();
        await expect(symbol).toHaveAttribute("viewBox", /^0 0 \d+(\.\d+)? \d+(\.\d+)?$/);
    });

    test("renders a GS1 Data Matrix without falling back to the error state", async ({ page }) => {
        const widget = page.locator(".mx-name-dataMatrixGs1");

        await expect(widget.locator(".datamatrix-svg svg")).toBeVisible();
        await expect(widget.locator(".alert-danger")).toHaveCount(0);
    });

    test("renders the rectangular shape wider than it is tall", async ({ page }) => {
        const symbol = page.locator(".mx-name-dataMatrixRectangle .datamatrix-svg svg");
        await expect(symbol).toBeVisible();

        await expect
            .poll(async () => {
                const box = await symbol.boundingBox();
                return box ? box.width > box.height : false;
            })
            .toBe(true);
    });

    test("re-renders when the bound value changes", async ({ page }) => {
        const symbol = page.locator(".mx-name-dataMatrixBound .datamatrix-svg svg");
        await expect(symbol).toBeVisible();
        const before = await symbol.getAttribute("viewBox");

        // A longer value needs more modules, so the symbol grows
        await page.locator(".mx-name-textBoxCodeValue input").fill("ABC-12345-67890-LONGER-VALUE");
        await page.locator(".mx-name-textBoxCodeValue input").blur();

        await expect(symbol).not.toHaveAttribute("viewBox", before);
    });

    test("downloads the Data Matrix as a PNG", async ({ page }) => {
        await expect(page.locator(".mx-name-dataMatrixDownload .datamatrix-svg svg")).toBeVisible();

        // Start waiting for the download before clicking
        const downloadPromise = page.waitForEvent("download");
        await page.locator(".mx-name-dataMatrixDownload .barcode-generator-download-button").click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toMatch(/\.png$/);
    });
});
