import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("gallery-web", () => {
    test.describe("capabilities: selection", () => {
        test("applies single select", async ({ page }) => {
            await page.goto("/p/single-selection");
            await page.waitForLoadState("networkidle");
            await expect(page.locator(".mx-name-gallery1")).toBeVisible();
            await page.locator(".mx-name-image1").first().click();
            await page.locator(".mx-name-feedback1").isHidden();
            await expect(page.locator(".mx-name-layoutGrid1").nth(1)).toHaveScreenshot(
                `gallerySingleSelection.png`,
                0.1
            );
        });

        test("applies multi select", async ({ page }) => {
            await page.goto("/p/multi-selection");
            await page.waitForLoadState("networkidle");
            await expect(page.locator(".mx-name-gallery1")).toBeVisible();
            await page.keyboard.down("Shift");
            await page.locator(".mx-name-image1").nth(0).click();
            await page.locator(".mx-name-image1").nth(1).click();
            await page.locator(".mx-name-image1").nth(2).click();
            await page.locator(".mx-name-feedback1").isHidden();
            await expect(page.locator(".mx-name-layoutGrid1").nth(1)).toHaveScreenshot(
                `galleryMultiSelection.png`,
                0.1
            );
        });
    });

    test.describe("a11y testing:", () => {
        test("checks accessibility violations", async ({ page }) => {
            await page.goto("/p/multi-selection");
            await page.waitForLoadState("networkidle");

            await page.locator(".mx-name-gallery1").waitFor();
            const accessibilityScanResults = await new AxeBuilder({ page })
                .include(".mx-name-gallery1")
                .withTags(["wcag21aa"])
                .exclude(".mx-name-navigationTree3")
                .analyze();

            expect(accessibilityScanResults.violations).toEqual([]);
        });
    });
});
