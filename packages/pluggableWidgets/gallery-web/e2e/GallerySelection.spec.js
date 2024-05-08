import { test, expect } from "@playwright/test";

test.describe("gallery-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/single-selection");
    });

    test.describe("capabilities: selection", () => {
        test("applies single select", async ({ page }) => {
            await expect(page.locator(".mx-name-gallery1")).toBeVisible();
            await page.locator(".mx-name-image1").first().click();
            await page.locator(".mx-name-feedback1").isHidden();
            await expect(page.locator(".mx-name-layoutGrid1").nth(1)).toHaveScreenshot(`gallerySingleSelection`, 0.1);
        });

        test("applies multi select", async ({ page }) => {
            await page.goto("/p/multi-selection");
            await expect(page.locator(".mx-name-gallery1")).toBeVisible();
            await page.locator(".mx-name-image1").nth(0).click();
            await page.locator(".mx-name-image1").nth(1).click();
            await page.locator(".mx-name-image1").nth(2).click();
            await page.locator(".mx-name-feedback1").isHidden();
            await expect(page.locator(".mx-name-layoutGrid1").nth(1)).toHaveScreenshot(`galleryMultiSelection`, 0.1);
        });
    });

    test.describe("a11y testing:", () => {
        test("checks accessibility violations", async ({ page }) => {
            await page.goto("/p/multi-selection");
            await page.installAccessibilityService();
            const snapshot = await page.accessibility.snapshot({
                rules: [
                    { id: "aria-required-children", reviewOnFail: true },
                    { id: "label", reviewOnFail: true },
                    { id: "aria-roles", reviewOnFail: true },
                    { id: "button-name", reviewOnFail: true },
                    { id: "duplicate-id-active", reviewOnFail: true },
                    { id: "aria-allowed-attr", reviewOnFail: true }
                ]
            });

            // Test the widget at initial load
            const gallerySelector = ".mx-name-gallery1";
            const gallerySnapshot = await page.accessibility.snapshot({
                root: await page.locator(gallerySelector).elementHandle(),
                runOnly: {
                    type: "tag",
                    values: ["wcag2a"]
                }
            });

            expect(snapshot.violations).toEqual([]);
            expect(gallerySnapshot.violations).toEqual([]);
        });
    });
});
