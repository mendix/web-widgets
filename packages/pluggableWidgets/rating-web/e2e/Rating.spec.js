import { test, expect } from "@playwright/test";

test.describe("Rating", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("compares with a screenshot baseline and checks if all rating elements are rendered as expected", async ({
        page
    }) => {
        await expect(page.locator(".mx-name-rating1")).toBeVisible();
        await expect(page.locator(".mx-name-ratingContent")).toHaveScreenshot(`ratingPageContent`);
    });
});
