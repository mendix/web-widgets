import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("Image viewer in different views", () => {
    const staticUrl = "https://picsum.photos/200/300";

    test("renders when listens to data grid", async ({ page }) => {
        await page.goto("/p/listenToGrid");
        await waitForMendixApp(page);
        await page.locator(".mx-name-grid1 [role='gridcell']").first().click();
        const imageElement = page.locator(".mx-name-dataView1 .mx-name-image1 img");
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });

    test("renders in a list view", async ({ page }) => {
        await page.goto("/p/listView");
        await waitForMendixApp(page);
        const imageElement = page.locator(".mx-name-image1 img").first();
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });

    test("renders in a gallery", async ({ page, browserName }) => {
        test.skip(browserName === "firefox", "Skipped for Firefox");
        await page.goto("/p/templateGrid");
        await waitForMendixApp(page);
        const imageElement = page.locator(".mx-name-templateGrid1 .mx-name-image1 img").first();
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });

    test("renders in a tab container", async ({ page, browserName }) => {
        test.skip(browserName === "firefox", "Skipped for Firefox");
        await page.goto("/p/tabContainer");
        await waitForMendixApp(page);
        await page.locator(".mx-name-tabPage2").click();
        const imageElement = page.locator(".mx-name-imageTabPage2 img");
        await expect(imageElement).toHaveAttribute("src", staticUrl);
    });
});
