import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("RichText", () => {
    test("compares with a screenshot baseline and checks if inline basic mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await page.click("text=Generate Data");
        await page.goto("/p/basic");
        await page.waitForLoadState("networkidle");
        await page.locator(".mx-name-richText1").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`inlineBasicMode.png`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if toolbar basic mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/basic");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`toolbarBasicMode.png`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if inline advanced mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/advanced");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`inlineAdvancedMode.png`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if toolbar advanced mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/advanced");
        await page.waitForLoadState("networkidle");
        await page.locator(".mx-name-richText4").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`toolbarAdvancedMode.png`, {
            threshold: 0.4
        });
    });

    test("compares with a screenshot baseline and checks if inline custom mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/custom");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`inlineCustomMode.png`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if toolbar custom mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/custom");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-richText2")).toBeVisible();
        await expect(page.locator(".mx-name-richText2")).toHaveScreenshot(`toolbarCustomMode.png`, { threshold: 0.4 });
    });

    test("compares with a screenshot baseline and checks if inline custom mode with all options enabled are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/custom");
        await page.waitForLoadState("networkidle");
        await page.locator(".mx-name-richText3").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText3")).toBeVisible();
        await expect(page.locator(".mx-name-richText3")).toHaveScreenshot(`customModeAllOptions.png`, {
            threshold: 0.4
        });
    });

    test("compares with a screenshot baseline and checks if toolbar custom mode with none option enabled are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/custom");
        await page.waitForLoadState("networkidle");
        await page.locator(".mx-name-richText4").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`customModeNoneOptions.png`, {
            threshold: 0.4
        });
    });
});
