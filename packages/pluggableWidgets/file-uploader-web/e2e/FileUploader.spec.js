import { Buffer } from "node:buffer";
import { test, expect } from "@mendix/run-e2e/fixtures";

// 1x1 red PNG
const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
    "base64"
);

const textFile = (name, size = 64) => ({ name, mimeType: "text/plain", buffer: Buffer.alloc(size, "a") });

class FileUploader {
    constructor(page, key) {
        this.root = page.locator(`.mx-name-fileUploader${key}`);
        this.uploaded = page.locator(`.mx-name-listViewUploaded${key}`);
    }

    get input() {
        return this.root.locator("input[type=file]");
    }

    entry(name) {
        return this.root.locator(".file-entry").filter({ has: this.root.page().getByText(name, { exact: true }) });
    }

    async upload(...files) {
        await this.input.setInputFiles(files);
    }
}

test.describe("file-uploader-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("files", () => {
        test("uploads a file and creates its file document", async ({ page }) => {
            const uploader = new FileUploader(page, "Files");

            await uploader.upload(textFile("notes.txt"));

            await expect(uploader.entry("notes.txt").locator(".upload-status")).toHaveText("Uploaded successfully.");
            await expect(uploader.uploaded).toContainText("notes.txt");
        });

        test("rejects a file format that is not allowed", async ({ page }) => {
            const uploader = new FileUploader(page, "Files");

            await uploader.upload(textFile("notes.txt"), {
                name: "report.pdf",
                mimeType: "application/pdf",
                buffer: Buffer.from("%PDF-1.4")
            });

            await expect(uploader.entry("report.pdf").locator(".upload-status")).toHaveText(
                "File format is not supported, supported formats are Text files."
            );
            await expect(uploader.uploaded).toContainText("notes.txt");
            await expect(uploader.uploaded).not.toContainText("report.pdf");
        });

        test("rejects a file that is too big", async ({ page }) => {
            const uploader = new FileUploader(page, "Files");

            await uploader.upload(textFile("notes.txt"), textFile("large.txt", 2 * 1024 * 1024));

            await expect(uploader.entry("large.txt").locator(".upload-status")).toHaveText(
                "File size exceeds the maximum limit of 1 megabytes."
            );
            await expect(uploader.uploaded).toContainText("notes.txt");
            await expect(uploader.uploaded).not.toContainText("large.txt");
        });

        test("uploads at most the maximum number of files", async ({ page }) => {
            const uploader = new FileUploader(page, "Files");

            await uploader.upload(textFile("one.txt"), textFile("two.txt"), textFile("three.txt"));
            for (const name of ["one.txt", "two.txt"]) {
                await expect(uploader.entry(name).locator(".upload-status")).toHaveText("Uploaded successfully.");
            }

            await expect(uploader.entry("three.txt").locator(".upload-status")).toHaveText(
                "Maximum file count of 2 reached."
            );
            await expect(uploader.uploaded).toContainText("one.txt");
            await expect(uploader.uploaded).toContainText("two.txt");
            await expect(uploader.uploaded).not.toContainText("three.txt");
        });

        test("removes an uploaded file", async ({ page }) => {
            const uploader = new FileUploader(page, "Files");
            await uploader.upload(textFile("notes.txt"));
            await expect(uploader.uploaded).toContainText("notes.txt");

            await uploader.entry("notes.txt").getByRole("button", { name: "Remove this file" }).click();

            await expect(uploader.uploaded).not.toContainText("notes.txt");
        });
    });

    test("uploads an image with a preview", async ({ page }) => {
        const uploader = new FileUploader(page, "Images");

        await uploader.upload({ name: "pixel.png", mimeType: "image/png", buffer: PNG });

        const entry = uploader.entry("pixel.png");
        await expect(entry.locator(".upload-status")).toHaveText("Uploaded successfully.");
        await expect(entry.locator("img.image-preview")).toBeVisible();
        await expect(uploader.uploaded).toContainText("pixel.png");
    });

    test("offers no upload when it is read-only", async ({ page }) => {
        const readOnly = new FileUploader(page, "ReadOnly");
        await expect(readOnly.root).toBeAttached();
        await expect(new FileUploader(page, "Files").input).toHaveCount(1);

        await expect(readOnly.input).toHaveCount(0);
        await expect(readOnly.root.locator(".dropzone")).toHaveCount(0);
    });
});
