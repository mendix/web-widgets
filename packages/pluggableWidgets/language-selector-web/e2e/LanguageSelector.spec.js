import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";
import AxeBuilder from "@axe-core/playwright";

test.describe("language-selector-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
    });

    test("checks if all elements are rendered as expected", async ({ page }) => {
        const languageSelectorElement = await page.locator(".mx-name-languageSelector1");
        await expect(languageSelectorElement).toBeVisible();
        await expect(page).toHaveScreenshot(`languageSelector.png`);
    });

    test("checks if Arabic language is rendered as expected", async ({ page }) => {
        await page.click(".current-language-text", { force: true });
        await page.click("text=Arabic");
        await expect(page).toHaveScreenshot(`languageSelectorArabic.png`);
    });

    test("checks if Chinese language is rendered as expected", async ({ page }) => {
        await page.click(".current-language-text", { force: true });
        await page.click("text=Chinese");
        await expect(page.getByText("欢迎")).toBeVisible();
        await expect(page.getByText("欢迎")).toContainText("欢迎");
    });

    test("checks accessibility violations", async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag21aa"])
            .disableRules([
                "aria-required-children",
                "label",
                "aria-roles",
                "button-name",
                "duplicate-id-active",
                "duplicate-id",
                "aria-allowed-attr"
            ])
            .exclude(".mx-name-navigationTree3")
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
