import { test, expect } from "@playwright/test";

test.describe("RichText", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("index.html");
        await page.click("text=Generate Data");
    });

    test("compares with a screenshot baseline and checks if inline basic mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/#/basic");
        await page.locator(".mx-name-richText1").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`inlineBasicMode`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if toolbar basic mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/#/basic");
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`toolbarBasicMode`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if inline advanced mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/#/advanced");
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`inlineAdvancedMode`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if toolbar advanced mode are rendered as expected", async ({
        page
    }) => {
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`toolbarAdvancedMode`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if inline custom mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/custom");
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`inlineCustomMode`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if toolbar custom mode are rendered as expected", async ({
        page
    }) => {
        await expect(page.locator(".mx-name-richText2")).toBeVisible();
        await expect(page.locator(".mx-name-richText2")).toHaveScreenshot(`toolbarCustomMode`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if inline custom mode with all options enabled are rendered as expected", async ({
        page
    }) => {
        await page.locator(".mx-name-richText3").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText3")).toBeVisible();
        await expect(page.locator(".mx-name-richText3")).toHaveScreenshot(`customModeAllOptions`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if toolbar custom mode with none option enabled are rendered as expected", async ({
        page
    }) => {
        await page.locator(".mx-name-richText4").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`customModeNoneOptions`, { threshold: 0.4 });
    });
});
