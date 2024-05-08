import { test, expect } from "@playwright/test";

test.describe("Image viewer", () => {
    const dynamicImage =
        "https://www.learningcontainer.com/wp-content/uploads/2020/08/Sample-png-Image-for-Testing.png";
    const dynamicImageNoUrl = "emptyUrl";
    const staticImage = "ImageViewer$Images$landscape_2.png";
    const staticUrl = "https://picsum.photos/200/300";

    test("loads an image from a dynamic url", async ({ page }) => {
        await page.goto("/p/dynamicUrl");
        const imageElement = await page.$(".mx-name-imageRender1 img");
        await expect(imageElement).toHaveAttribute("src", dynamicImage);
    });

    test.skip("loads an image from a dynamic url association", async ({ page }) => {
        await page.goto("/p/dynamicUrlAssociation");
        const imageElement = await page.$(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", dynamicImage);
    });

    // todo: unskip once we figure out why this spec is failing.
    test.skip("loads no image when no image url is specified", async ({ page }) => {
        await page.goto("/p/emptyUrl");
        const imageElement = await page.$(".mx-name-image1.hidden img");
        await expect(imageElement).toHaveAttribute("src", dynamicImageNoUrl);
    });

    test("loads an image from a static image", async ({ page }) => {
        await page.goto("/p/staticImage");
        const imageElement = await page.$(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", /staticImage/);
    });

    test("loads an image from a static URL", async ({ page }) => {
        await page.goto("/p/staticUrl");
        const imageElement = await page.$(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });
});
