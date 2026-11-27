import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("Image viewer", () => {
    const dynamicImage =
        "https://www.learningcontainer.com/wp-content/uploads/2020/08/Sample-png-Image-for-Testing.png";
    const staticUrl = "https://picsum.photos/200/300";

    test("loads an image from a dynamic url", async ({ page }) => {
        await page.goto("/p/dynamicUrl");
        await waitForMendixApp(page);
        const imageElement = await page.locator(".mx-name-imageRender1 img");
        await expect(imageElement).toHaveAttribute("src", dynamicImage);
    });

    test("loads an image from a dynamic url association", async ({ page }) => {
        const associatedImage = "https://silkui.outsystems.com/IframePreview/img/IframePreview.landscape_3.png";
        await page.goto("/p/dynamicUrlAssociation");
        await waitForMendixApp(page);
        const imageElement = page.locator(".mx-name-imageRender3 img");
        await expect(imageElement).toHaveAttribute("src", associatedImage);
    });

    test("loads no image when no image url is specified", async ({ page }) => {
        await page.goto("/p/emptyUrl");
        await waitForMendixApp(page);
        const urlInput = page.locator(".mx-name-textArea1 textarea");
        await expect(urlInput).toHaveValue("");

        await expect(page.locator(".mx-name-image1 img")).toHaveCount(0);

        await urlInput.fill(dynamicImage);
        await urlInput.blur();
        await expect(page.locator(".mx-name-image1 img")).toHaveAttribute("src", dynamicImage);
    });

    test("loads an image from a static image", async ({ page }) => {
        await page.goto("/p/staticImage");
        await waitForMendixApp(page);
        const imageElement = await page.locator(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", /ImageViewer\$Images\$landscape_2\.png/);
    });

    test("loads an image from a static URL", async ({ page }) => {
        await page.goto("/p/staticUrl");
        await waitForMendixApp(page);
        const imageElement = await page.locator(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });
});
