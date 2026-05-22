import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("Rating", () => {
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
