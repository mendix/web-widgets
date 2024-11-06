import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("language-selector-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
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
        await page.waitForLoadState("networkidle");
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
