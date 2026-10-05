import { test, expect } from "@mendix/run-e2e/fixtures";

// All tests share one FileHolder object in the test project, so parallel workers race on its image.
test.describe.configure({ mode: "default" });

test.describe("Image cropper", () => {
    const widget = page => page.locator(".mx-name-imageCropperE2E");
    const image = page => widget(page).locator(".widget-image-cropper__canvas img");
    const cropAppliedDialog = page =>
        page.locator(".modal-dialog").filter({ has: page.locator(".mx-name-cropAppliedText") });

    test.beforeEach(async ({ page }) => {
        await page.goto("/p/image-cropper-e2e");
        await expect(image(page)).toBeVisible();
        // The crop box is seeded on image load; actions before that are ignored by the widget.
        await expect(widget(page).locator(".ReactCrop__crop-selection")).toBeVisible();
    });

    test("renders the image with toolbar controls @smoke", async ({ page }) => {
        const cropper = widget(page);

        await expect(cropper.locator(".ReactCrop__crop-selection")).toBeVisible();
        await expect(cropper.getByRole("button", { name: "Rotate left" })).toBeVisible();
        await expect(cropper.getByRole("button", { name: "Rotate right" })).toBeVisible();
        await expect(cropper.getByRole("button", { name: "Grayscale" })).toHaveAttribute("aria-pressed", "false");
        await expect(cropper.getByRole("slider", { name: "Zoom" })).toHaveValue("1");
        await expect(cropper.getByRole("button", { name: "Reset crop" })).toBeVisible();
    });

    test("zooms the image with the slider and runs the on crop action", async ({ page }) => {
        await widget(page).getByRole("slider", { name: "Zoom" }).fill("2");

        await expect(image(page)).toHaveCSS("transform", "matrix(2, 0, 0, 2, 0, 0)");
        await expect(cropAppliedDialog(page)).toBeVisible();
    });

    test("toggles grayscale and runs the on crop action", async ({ page }) => {
        const grayscale = widget(page).getByRole("button", { name: "Grayscale" });

        await grayscale.click();

        await expect(grayscale).toHaveAttribute("aria-pressed", "true");
        await expect(image(page)).toHaveCSS("filter", "grayscale(1)");
        await expect(cropAppliedDialog(page)).toBeVisible();
    });

    test("runs the on crop action after dragging the crop selection", async ({ page }) => {
        const selection = widget(page).locator(".ReactCrop__crop-selection");
        const box = await selection.boundingBox();
        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(startX + 20, startY + 15, { steps: 5 });
        await page.mouse.up();

        await expect(cropAppliedDialog(page)).toBeVisible();
    });

    test("rotates the image and restores it on reset", async ({ page }) => {
        const cropper = widget(page);
        const canvas = cropper.locator(".widget-image-cropper__canvas");
        const reset = cropper.getByRole("button", { name: "Reset crop" });

        await cropper.getByRole("button", { name: "Rotate right" }).click();

        await expect(image(page)).toHaveAttribute("src", /^blob:/);
        await expect(canvas).toHaveScreenshot("imageCropperCanvasRotated.png");

        await expect(reset).toBeEnabled();
        await reset.click();

        await expect(canvas).toHaveScreenshot("imageCropperCanvasDefault.png");
    });

    test("matches the default visual state", async ({ page }) => {
        const cropper = widget(page);

        await expect(cropper).toBeVisible();
        await expect(cropper).toHaveScreenshot("imageCropperDefault.png");
        await expect(cropper.locator(".widget-image-cropper__canvas")).toHaveScreenshot(
            "imageCropperCanvasDefault.png"
        );
    });
});
