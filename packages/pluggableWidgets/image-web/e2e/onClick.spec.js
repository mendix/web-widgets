import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Image viewer", () => {
    const dynamicImage =
        "https://www.learningcontainer.com/wp-content/uploads/2020/08/Sample-png-Image-for-Testing.png";

    test("triggers a Microflow on click", async ({ page }) => {
        await page.goto("/p/onClickMicroflow");
        await page.waitForLoadState("networkidle");
        await page.click(".mx-name-image1");
        const modalDialog = await page.locator(".modal-dialog");
        await expect(modalDialog).toContainText("You clicked this image");
    });

    test("triggers a Nanoflow on click", async ({ page }) => {
        await page.goto("/p/onClickNanoflow");
        await page.waitForLoadState("networkidle");
        await page.click(".mx-name-image1");
        const modalDialog = await page.locator(".modal-dialog");
        await expect(modalDialog).toContainText(dynamicImage);
    });

    test("opens a Page on click", async ({ page }) => {
        await page.goto("/p/onClickShowPage");
        await page.waitForLoadState("networkidle");
        await page.click(".mx-name-image1");
        const modalDialog = await page.locator(".modal-dialog");
        const caption = await modalDialog.locator("#mxui_widget_Window_0_caption");
        await expect(caption).toContainText("GazaLand");
    });

    test("shows full screen image on click", async ({ page }) => {
        await page.goto("/p/onClickOpenFullScreen");
        await page.waitForLoadState("networkidle");
        await page.click(".mx-name-imageRender1");
        const lightboxImage = await page.locator(".mx-image-viewer-lightbox img");
        await expect(lightboxImage).toHaveAttribute("src", /ImageViewer\$Images\$landscape_2\.png/);
    });
});
