import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";
import AxeBuilder from "@axe-core/playwright";

test.describe("gallery-web", () => {
    test.describe("capabilities: selection", () => {
        test("applies single select", async ({ page }) => {
            await page.goto("/p/single-selection");
            await waitForMendixApp(page);
            await expect(page.locator(".mx-name-gallery1")).toBeVisible();
            await page.locator(".mx-name-image1").first().click();
            await page.locator(".mx-name-feedback1").isHidden();
            await expect(page.locator(".mx-name-layoutGrid1").nth(1)).toHaveScreenshot(`gallerySingleSelection.png`);
        });

        test("applies multi select", async ({ page }) => {
            await page.goto("/p/multi-selection");
            await waitForMendixApp(page);
            await expect(page.locator(".mx-name-gallery1")).toBeVisible();
            await page.keyboard.down("Shift");
            await page.locator(".mx-name-image1").nth(0).click();
            await page.locator(".mx-name-image1").nth(1).click();
            await page.locator(".mx-name-image1").nth(2).click();
            await page.locator(".mx-name-feedback1").isHidden();
            await expect(page.locator(".mx-name-layoutGrid1").nth(1)).toHaveScreenshot(`galleryMultiSelection.png`);
        });
    });

    test.describe("a11y testing:", () => {
        test("checks accessibility violations", async ({ page }) => {
            await page.goto("/p/multi-selection");
            await waitForMendixApp(page);

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
