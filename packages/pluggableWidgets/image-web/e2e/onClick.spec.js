import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("Image viewer", () => {
    const dynamicImage =
        "https://www.learningcontainer.com/wp-content/uploads/2020/08/Sample-png-Image-for-Testing.png";

    test("triggers a Microflow on click", async ({ page }) => {
        await page.goto("/p/onClickMicroflow");
        await waitForMendixApp(page);
        await page.click(".mx-name-image1");
        const modalDialog = await page.locator(".modal-dialog");
        await expect(modalDialog).toContainText("You clicked this image");
    });

    test("triggers a Nanoflow on click", async ({ page }) => {
        await page.goto("/p/onClickNanoflow");
        await waitForMendixApp(page);
        await page.click(".mx-name-image1");
        const modalDialog = await page.locator(".modal-dialog");
        await expect(modalDialog).toContainText(dynamicImage);
    });

    test("opens a Page on click", async ({ page }) => {
        await page.goto("/p/onClickShowPage");
        await waitForMendixApp(page);
        await page.click(".mx-name-image1");
        const modalDialog = await page.locator(".modal-dialog");
        const caption = await modalDialog.locator("#mxui_widget_Window_0_caption");
        await expect(caption).toContainText("GazaLand");
    });

    test("shows full screen image on click", async ({ page }) => {
        await page.goto("/p/onClickOpenFullScreen");
        await waitForMendixApp(page);
        await page.click(".mx-name-imageRender1");
        const lightboxImage = await page.locator(".mx-image-viewer-lightbox img");
        await expect(lightboxImage).toHaveAttribute("src", /ImageViewer\$Images\$landscape_2\.png/);
    });
});
