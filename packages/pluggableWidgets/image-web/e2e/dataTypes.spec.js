import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Image viewer", () => {
    const dynamicImage =
        "https://www.learningcontainer.com/wp-content/uploads/2020/08/Sample-png-Image-for-Testing.png";
    const dynamicImageNoUrl = "emptyUrl";
    const staticUrl = "https://picsum.photos/200/300";

    test("loads an image from a dynamic url", async ({ page }) => {
        await page.goto("/p/dynamicUrl");
        await page.waitForLoadState("networkidle");
        const imageElement = await page.locator(".mx-name-imageRender1 img");
        await expect(imageElement).toHaveAttribute("src", dynamicImage);
    });

    // todo: unskip once we figure out why this spec is failing.
    test.skip("loads an image from a dynamic url association", async ({ page }) => {
        await page.goto("/p/dynamicUrlAssociation");
        await page.waitForLoadState("networkidle");
        const imageElement = await page.locator(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", dynamicImage);
    });

    // todo: unskip once we figure out why this spec is failing.
    test.skip("loads no image when no image url is specified", async ({ page }) => {
        await page.goto("/p/emptyUrl");
        await page.waitForLoadState("networkidle");
        const imageElement = await page.locator(".mx-name-image1.hidden img");
        await expect(imageElement).toHaveAttribute("src", dynamicImageNoUrl);
    });

    test("loads an image from a static image", async ({ page }) => {
        await page.goto("/p/staticImage");
        await page.waitForLoadState("networkidle");
        const imageElement = await page.locator(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", /ImageViewer\$Images\$landscape_2\.png/);
    });

    test("loads an image from a static URL", async ({ page }) => {
        await page.goto("/p/staticUrl");
        await page.waitForLoadState("networkidle");
        const imageElement = await page.locator(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });
});
