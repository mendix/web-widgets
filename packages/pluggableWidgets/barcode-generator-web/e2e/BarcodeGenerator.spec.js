import { test, expect } from "@mendix/run-e2e/fixtures";
import { checkAccessibility } from "@mendix/run-e2e/mendix-helpers";

const linearFormats = [
    "bcCode128",
    "bcEan13",
    "bcEan8",
    "bcUpc",
    "bcItf14",
    "bcCode39",
    "bcMsi",
    "bcPharmacode",
    "bcCodabar",
    "bcCode93"
];

/**
 * Runs against the `MyFirstModule.Home_Web` page (`/`) of the test project:
 *   - bcCode128 ... bcCode93   one widget per linear format, value shown, rendered as card
 *   - bcQrCode                 QR code
 *   - bcDataMatrix             Data Matrix
 *   - bcDataMatrixGs1          GS1 Data Matrix
 */
test.describe("BarcodeGenerator formats", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    for (const name of linearFormats) {
        test(`${name} renders bars without falling back to the error state`, async ({ page }) => {
            const widget = page.locator(`.mx-name-${name}`);

            await expect(widget.locator(".barcode-renderer > svg > g").first()).toBeVisible();
            await expect(widget.locator(".alert-danger")).toHaveCount(0);
        });

        test(`${name} matches the visual baseline`, async ({ page }) => {
            const symbol = page.locator(`.mx-name-${name} .barcode-renderer > svg`);

            await expect(symbol.locator("g").first()).toBeVisible();
            await expect(symbol).toHaveScreenshot(`${name}.png`);
        });
    }

    test("renders a QR code as SVG at the configured size @smoke", async ({ page }) => {
        const symbol = page.locator(".mx-name-bcQrCode .qrcode-renderer svg");

        await expect(symbol).toBeVisible();
        await expect(symbol).toHaveAttribute("width", "128");
        await expect(symbol).toHaveAttribute("height", "128");
    });

    test("bcQrCode matches the visual baseline", async ({ page }) => {
        const symbol = page.locator(".mx-name-bcQrCode .qrcode-renderer svg");

        await expect(symbol).toBeVisible();
        await expect(symbol).toHaveScreenshot("bcQrCode.png");
    });

    test("applies the card modifier when shown as card", async ({ page }) => {
        await expect(page.locator(".mx-name-bcCode128")).toHaveClass(/barcode-generator--as-card/);
    });

    test("has no accessibility violations", async ({ page }) => {
        await expect(page.locator(".mx-name-bcDataMatrixGs1 .datamatrix-svg svg")).toBeVisible();

        await checkAccessibility(page, ".mx-name-grdMain");
    });
});

/**
 * Runs against the `MyFirstModule.DataMatrix` page (`/p/datamatrix`) of the test project:
 *   - dataMatrixPlain        Data Matrix, GS1 off, square
 *   - dataMatrixGs1          Data Matrix, GS1 on
 *   - dataMatrixRectangle    Data Matrix, shape Rectangle
 *   - dataMatrixDownload     Data Matrix with "Allow download" on, file name "datamatrix"
 *   - textBoxCodeValue       text box bound to the attribute dataMatrixBound reads from
 *   - dataMatrixBound        Data Matrix bound to that attribute
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

    test("downloads the Data Matrix as a PNG named after the configured file name", async ({ page }) => {
        await expect(page.locator(".mx-name-dataMatrixDownload .datamatrix-svg svg")).toBeVisible();

        // Start waiting for the download before clicking
        const downloadPromise = page.waitForEvent("download");
        await page.locator(".mx-name-dataMatrixDownload .barcode-generator-download-button").click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toBe("datamatrix.png");
    });

    for (const name of ["dataMatrixPlain", "dataMatrixGs1", "dataMatrixRectangle"]) {
        test(`${name} matches the visual baseline`, async ({ page }) => {
            const symbol = page.locator(`.mx-name-${name} .datamatrix-svg`);

            await expect(symbol.locator("svg")).toBeVisible();
            await expect(symbol).toHaveScreenshot(`${name}.png`);
        });
    }
});

/**
 * Runs against the `MyFirstModule.Scenarios` page (`/p/scenarios`) of the test project.
 *
 * Inside `dataViewBound`, all reading the attribute `textBoxCodeValue` edits (initially "ABC-12345"):
 *   - code39Bound            CODE39, log level Info
 *   - code39BoundSilent      CODE39, log level None
 *   - qrBound                QR code
 *   - gs1Bound               GS1 Data Matrix
 *   - addonBound             EAN-13 with a static value, EAN-5 addon bound to the attribute
 *
 * Static widgets:
 *   - emptyValue             empty value, empty message "Nothing to encode"
 *   - barcodeDownloadTop     CODE128, download button on top, file name "barcode"
 *   - qrDownloadAuto         QR code, download button at the bottom, no file name
 *   - qrTitled               QR code, title "Scan me" shown, level H, size 200, margin 4
 *   - ean13Ean5              EAN-13 with EAN-5 addon, spacing 30
 *   - ean8Ean2               EAN-8 with EAN-2 addon
 *   - ean13Flat              EAN-13, flat
 *   - ean13LastChar          EAN-13, last character ">"
 *   - code128Ean128          CODE128 encoded as GS1-128
 *   - code39Mod43            CODE39 with Mod43 check digit
 *   - code128Sized           CODE128, bar width 1, height 80, margin 10
 *   - dataMatrixGs1Rectangle GS1 Data Matrix, rectangle, size 200, margin 4
 */
test.describe("BarcodeGenerator scenarios", () => {
    const emptyMessage = "Nothing to encode";

    async function setCodeValue(page, value) {
        const input = page.locator(".mx-name-textBoxCodeValue input");
        await input.fill(value);
        await input.blur();
    }

    test.beforeEach(async ({ page }) => {
        await page.goto("/p/scenarios");
    });

    test.describe("error state", () => {
        test("shows an alert for a malformed GS1 value and renders once it is valid", async ({ page }) => {
            const widget = page.locator(".mx-name-gs1Bound");
            await expect(widget.getByRole("alert")).toBeVisible();
            await expect(widget.locator(".datamatrix-svg")).toHaveCount(0);

            await setCodeValue(page, "(01)09501101020917");

            await expect(widget.locator(".datamatrix-svg svg")).toBeVisible();
            await expect(widget.getByRole("alert")).toHaveCount(0);
        });

        // FIXME: a linear barcode never leaves the error state. BarcodeRenderer drops the <svg> while
        // in error, so useRenderBarcode has no element to draw into when the value becomes valid again.
        test.fixme("shows an alert for an invalid EAN-5 addon and renders once it is valid", async ({ page }) => {
            const widget = page.locator(".mx-name-addonBound");
            await expect(widget.getByRole("alert")).toBeVisible();

            await setCodeValue(page, "12345");

            await expect(widget.locator(".barcode-renderer > svg > g").first()).toBeVisible();
            await expect(widget.getByRole("alert")).toHaveCount(0);
        });

        test("shows an alert when a linear barcode value becomes invalid", async ({ page }) => {
            const widget = page.locator(".mx-name-code39Bound");
            await expect(widget.locator(".barcode-renderer > svg > g").first()).toBeVisible();

            // CODE39 does not accept lowercase letters
            await setCodeValue(page, "lowercase");

            await expect(widget.getByRole("alert")).toBeVisible();
        });

        // FIXME: a linear barcode never leaves the error state. BarcodeRenderer drops the <svg> while
        // in error, so useRenderBarcode has no element to draw into when the value becomes valid again.
        test.fixme("recovers from the error state when the value becomes valid again", async ({ page }) => {
            const widget = page.locator(".mx-name-code39Bound");
            await setCodeValue(page, "lowercase");
            await expect(widget.getByRole("alert")).toBeVisible();

            await setCodeValue(page, "VALID-39");

            await expect(widget.locator(".barcode-renderer > svg > g").first()).toBeVisible();
            await expect(widget.getByRole("alert")).toHaveCount(0);
        });

        test("renders nothing for an invalid value when log level is None", async ({ page }) => {
            const widget = page.locator(".mx-name-code39BoundSilent");
            await expect(widget.locator(".barcode-renderer > svg > g").first()).toBeVisible();

            await setCodeValue(page, "lowercase");

            // Wait on the sibling that does report, then check this one stayed silent
            await expect(page.locator(".mx-name-code39Bound").getByRole("alert")).toBeVisible();
            await expect(widget.getByRole("alert")).toHaveCount(0);
            await expect(widget.locator("svg")).toHaveCount(0);
        });
    });

    test.describe("empty state", () => {
        test("shows the empty message for an empty value", async ({ page }) => {
            await expect(page.locator(".mx-name-qrBound svg")).toBeVisible();

            await expect(page.getByText(emptyMessage)).toHaveCount(1);
        });

        test("replaces the code with the empty message when the bound value is cleared", async ({ page }) => {
            await expect(page.locator(".mx-name-qrBound svg")).toBeVisible();

            await setCodeValue(page, "");

            // emptyValue plus the four widgets that read their value from the attribute
            await expect(page.getByText(emptyMessage)).toHaveCount(5);
            await expect(page.locator(".mx-name-qrBound")).toHaveCount(0);
        });
    });

    test.describe("dynamic value", () => {
        test("re-renders the QR code when the bound value changes", async ({ page }) => {
            const modules = page.locator(".mx-name-qrBound svg path").last();
            await expect(modules).toBeVisible();
            const before = await modules.getAttribute("d");

            await setCodeValue(page, "A-DIFFERENT-VALUE");

            await expect(modules).not.toHaveAttribute("d", before);
        });

        test("re-renders the linear barcode when the bound value changes", async ({ page }) => {
            const symbol = page.locator(".mx-name-code39Bound .barcode-renderer > svg");
            await expect(symbol.locator("g").first()).toBeVisible();
            const before = await symbol.getAttribute("width");

            // More characters need more bars, so the symbol grows
            await setCodeValue(page, "ABC-12345-67890-LONGER");

            await expect(symbol).not.toHaveAttribute("width", before);
        });
    });

    test.describe("download", () => {
        test("downloads a linear barcode named after the configured file name", async ({ page }) => {
            const widget = page.locator(".mx-name-barcodeDownloadTop");
            await expect(widget.locator(".barcode-renderer > svg > g").first()).toBeVisible();

            const downloadPromise = page.waitForEvent("download");
            await widget.getByRole("button", { name: "Download barcode" }).click();
            const download = await downloadPromise;

            expect(download.suggestedFilename()).toBe("barcode.png");
        });

        test("downloads a QR code with a generated file name", async ({ page }) => {
            const widget = page.locator(".mx-name-qrDownloadAuto");
            await expect(widget.locator("svg").first()).toBeVisible();

            const downloadPromise = page.waitForEvent("download");
            await widget.getByRole("button", { name: "Download QR code" }).click();
            const download = await downloadPromise;

            expect(download.suggestedFilename()).toMatch(/^qrcode_[a-z0-9]+_\d{8}_\d{6}\.png$/);
        });

        test("downloads when the button is activated with the keyboard", async ({ page }) => {
            const button = page
                .locator(".mx-name-barcodeDownloadTop")
                .getByRole("button", { name: "Download barcode" });
            await expect(button).toBeVisible();

            await button.focus();
            await expect(button).toBeFocused();
            const downloadPromise = page.waitForEvent("download");
            await page.keyboard.press("Enter");
            const download = await downloadPromise;

            expect(download.suggestedFilename()).toBe("barcode.png");
        });

        test("places the download button above the code for position Top", async ({ page }) => {
            const renderer = page.locator(".mx-name-barcodeDownloadTop .barcode-renderer");

            await expect(renderer.locator("> :first-child")).toHaveClass(/barcode-generator-download-button/);
        });

        test("places the download button below the code for position Bottom", async ({ page }) => {
            const renderer = page.locator(".mx-name-qrDownloadAuto .qrcode-renderer");

            await expect(renderer.locator("> :last-child")).toHaveClass(/barcode-generator-download-button/);
        });
    });

    test.describe("QR code options", () => {
        test("shows the title above the QR code", async ({ page }) => {
            const widget = page.locator(".mx-name-qrTitled");

            await expect(widget.getByRole("heading", { name: "Scan me" })).toBeVisible();
        });

        test("renders at the configured size", async ({ page }) => {
            const symbol = page.locator(".mx-name-qrTitled .qrcode-renderer svg");

            await expect(symbol).toHaveAttribute("width", "200");
            await expect(symbol).toHaveAttribute("height", "200");
        });
    });

    test("renders the Data Matrix at the configured size", async ({ page }) => {
        const symbol = page.locator(".mx-name-dataMatrixGs1Rectangle .datamatrix-svg");

        await expect(symbol.locator("svg")).toBeVisible();
        await expect(symbol).toHaveCSS("width", "200px");
    });

    for (const name of ["ean13Ean5", "ean8Ean2", "ean13Flat", "ean13LastChar", "code128Ean128", "code39Mod43"]) {
        test(`${name} renders bars without falling back to the error state`, async ({ page }) => {
            const widget = page.locator(`.mx-name-${name}`);

            await expect(widget.locator(".barcode-renderer > svg > g").first()).toBeVisible();
            await expect(widget.getByRole("alert")).toHaveCount(0);
        });
    }

    for (const name of [
        "ean13Ean5",
        "ean8Ean2",
        "ean13Flat",
        "ean13LastChar",
        "code128Ean128",
        "code39Mod43",
        "code128Sized"
    ]) {
        test(`${name} matches the visual baseline`, async ({ page }) => {
            const symbol = page.locator(`.mx-name-${name} .barcode-renderer > svg`);

            await expect(symbol.locator("g").first()).toBeVisible();
            await expect(symbol).toHaveScreenshot(`${name}.png`);
        });
    }

    // The widget itself spans the page width, so capture the symbol only
    for (const [name, selector] of [
        ["qrTitled", ".qrcode-renderer svg"],
        ["dataMatrixGs1Rectangle", ".datamatrix-svg"]
    ]) {
        test(`${name} matches the visual baseline`, async ({ page }) => {
            const symbol = page.locator(`.mx-name-${name} ${selector}`);

            await expect(symbol).toBeVisible();
            await expect(symbol).toHaveScreenshot(`${name}.png`);
        });
    }

    test("has no accessibility violations", async ({ page }) => {
        await expect(page.locator(".mx-name-dataMatrixGs1Rectangle .datamatrix-svg svg")).toBeVisible();

        await checkAccessibility(page, ".mx-name-grdMain");
    });
});
