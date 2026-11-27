import { createRequire } from "node:module";
import { join } from "node:path";
import process from "node:process";
import { test, expect } from "@mendix/run-e2e/fixtures";

// Playwright runs from the package directory.
const require = createRequire(join(process.cwd(), "package.json"));
const pdfjsVersion = require("pdfjs-dist/package.json").version;
const pdfjsWorker = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");

const viewer = (page, type) => page.locator(`.mx-name-documentViewer${type}`);

async function waitForFirstPdfPage(pdf) {
    await expect(pdf.locator(".react-pdf__Page")).toContainText("First page of the PDF", { timeout: 15_000 });
}

test.describe("document-viewer-web", () => {
    test.beforeEach(async ({ page }) => {
        // The widget loads the PDF.js worker from unpkg by default; serve the installed copy of that version instead,
        // so the tests don't depend on the CDN.
        await page.route(`**/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`, route =>
            route.fulfill({ path: pdfjsWorker, contentType: "text/javascript" })
        );
        await page.goto("/");
    });

    test.describe("PDF", () => {
        test("renders the first page with the page count", async ({ page }) => {
            const pdf = viewer(page, "Pdf");

            await waitForFirstPdfPage(pdf);

            await expect(pdf.locator(".document-title")).toHaveText("sample.pdf");
            await expect(pdf.locator(".widget-document-viewer-total-pages")).toHaveText("/ 2");
        });

        test("goes to the next and previous page", async ({ page }) => {
            const pdf = viewer(page, "Pdf");
            const pageNumber = pdf.getByRole("textbox", { name: "Page number" });
            await waitForFirstPdfPage(pdf);

            await pdf.getByRole("button", { name: "Go to next page" }).click();
            await expect(pageNumber).toHaveValue("2");
            await expect(pdf.locator(".react-pdf__Page")).toContainText("Second page of the PDF");

            await pdf.getByRole("button", { name: "Go to previous page" }).click();
            await expect(pageNumber).toHaveValue("1");
            await expect(pdf.locator(".react-pdf__Page")).toContainText("First page of the PDF");
        });

        test("goes to the page that matches the search", async ({ page }) => {
            const pdf = viewer(page, "Pdf");
            await waitForFirstPdfPage(pdf);

            await pdf.getByRole("button", { name: "Search in document" }).click();
            await pdf.getByRole("searchbox", { name: "Search in document" }).fill("Second page");

            await expect(pdf.getByRole("textbox", { name: "Page number" })).toHaveValue("2");
            await expect(pdf.locator(".widget-document-viewer-highlight")).toHaveCount(1);
        });

        test("zooms in", async ({ page }) => {
            const pdf = viewer(page, "Pdf");
            const canvas = pdf.locator(".react-pdf__Page canvas");
            await waitForFirstPdfPage(pdf);
            const { width } = await canvas.boundingBox();

            await pdf.getByRole("button", { name: "Zoom in" }).click();

            await expect.poll(async () => (await canvas.boundingBox()).width).toBeGreaterThan(width);
        });
    });

    test("renders a text document", async ({ page }) => {
        const text = viewer(page, "Text");

        await expect(text.locator(".document-title")).toHaveText("sample.txt");
        await expect(text.locator(".text-content")).toHaveText(
            "Hello from a text document.\nSecond line of the text document.\n"
        );
    });

    test("renders an image", async ({ page }) => {
        const image = viewer(page, "Image").locator(".widget-document-viewer-content img");

        await expect(image).toBeVisible();
        await expect(image).toHaveJSProperty("naturalWidth", 60);
    });

    test("renders a Word document", async ({ page }) => {
        const word = viewer(page, "Word");

        await expect(word.locator(".docx-viewer-container")).toContainText("Hello from a Word document");
    });

    test("renders an Excel workbook", async ({ page }) => {
        const excel = viewer(page, "Excel");

        await expect(excel.locator(".xlsx-viewer-content table")).toContainText("Apple");
    });

    test("reports a document type it can't render", async ({ page }) => {
        const unsupported = viewer(page, "Unsupported");

        await expect(unsupported.locator(".document-title")).toHaveText("sample.zip");
        await expect(unsupported.locator(".widget-document-viewer-content")).toHaveText("Unsupported document type");
    });

    test("downloads the document", async ({ page }) => {
        const text = viewer(page, "Text");
        await expect(text.locator(".text-content")).toContainText("Hello from a text document.");

        const popupPromise = page.waitForEvent("popup");
        await text.getByRole("button", { name: "Download" }).click();
        const popup = await popupPromise;

        await expect(popup).toHaveURL(/[?&]target=window/);
    });
});
