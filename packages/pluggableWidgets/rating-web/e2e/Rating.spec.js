import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("Rating", () => {
    // Tall enough for the whole page content: the page scrolls inside the layout, and the screenshot
    // only covers what is visible.
    test.use({ viewport: { width: 1280, height: 1200 } });

    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
    });

    test("compares with a screenshot baseline and checks if all rating elements are rendered as expected", async ({
        page
    }) => {
        await expect(page.locator(".mx-name-rating1")).toBeVisible();
        await expect(page.locator(".mx-name-ratingContent")).toHaveScreenshot(`ratingPageContent.png`);
    });
});
