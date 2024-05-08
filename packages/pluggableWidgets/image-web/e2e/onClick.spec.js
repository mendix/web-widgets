import { test, expect } from "@playwright/test";

test.describe("Image viewer", () => {
    const dynamicImage =
        "https://www.learningcontainer.com/wp-content/uploads/2020/08/Sample-png-Image-for-Testing.png";
    const staticImage = "ImageViewer$Images$landscape_2.png";

    test("triggers a Microflow on click", async ({ page }) => {
        await page.goto("/p/onClickMicroflow");
        await page.click(".mx-name-image1");
        const modalDialog = await page.$(".modal-dialog");
        await expect(modalDialog).toContainText("You clicked this image");
    });

    test("triggers a Nanoflow on click", async ({ page }) => {
        await page.goto("/p/onClickNanoflow");
        await page.click(".mx-name-image1");
        const modalDialog = await page.$(".modal-dialog");
        await expect(modalDialog).toContainText(dynamicImage);
    });

    test("opens a Page on click", async ({ page }) => {
        await page.goto("/p/onClickShowPage");
        await page.click(".mx-name-image1");
        const modalDialog = await page.$(".modal-dialog");
        const caption = await modalDialog.$("#mxui_widget_Window_0_caption");
        await expect(caption).toContainText("GazaLand");
    });

    test("shows full screen image on click", async ({ page }) => {
        await page.goto("/p/onClickOpenFullScreen");
        await page.click(".mx-name-imageRender1");
        const lightboxImage = await page.$(".mx-image-viewer-lightbox img");
        await expect(lightboxImage).toHaveAttribute("src", staticImage);
    });
});
