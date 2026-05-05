import { test, expect } from "@mendix/run-e2e/fixtures";

// Conditional flag added to skip these tests when running on react client, because those widgets aren't supported in the react client
test.describe.skip(process.env.MODERN_CLIENT === true, () => {
    const staticUrl = "https://picsum.photos/200/300";

    test("renders when listens to data grid", async ({ page }) => {
        await page.goto("/p/listenToGrid");
        await page.click(".mx-name-index-0");
        const imageElement = await page.locator(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });

    test("renders in a list view", async ({ page }) => {
        await page.goto("/p/listView");
        const imageElement = await page.locator(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });

    test("renders in a template grid", async ({ page, browserName }) => {
        test.skip(browserName === "firefox", "Skipped for Firefox");
        await page.goto("/p/templateGrid");
        const imageElement = await page.locator(".mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });

    test("renders in a tab container", async ({ page, browserName }) => {
        test.skip(browserName === "firefox", "Skipped for Firefox");
        await page.goto("/p/tabContainer");
        await page.click(".mx-name-tabPage2");
        const imageElement = await page.locator(".mx-name-imageTabPage2 img");
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });
});
