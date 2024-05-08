import { test, expect } from "@playwright/test";

test.describe("language-selector-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("checks if all elements are rendered as expected", async ({ page }) => {
        const languageSelectorElement = await page.$(".mx-name-languageSelector1");
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
        await expect(page).toHaveScreenshot(`languageSelectorChinese.png`);
    });
});
