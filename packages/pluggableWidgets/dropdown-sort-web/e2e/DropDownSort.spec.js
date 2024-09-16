import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("dropdown-sort-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("shows the descending order", async ({ page }) => {
        await page.locator(".mx-name-drop_downSort1").click();
        await page.locator(".dropdown-list > li:nth-child(2)").click();
        await page.locator(".mx-name-drop_downSort1").locator(".btn").first().click();
        await expect(page.locator(".mx-name-gallery1").locator(".widget-gallery-item").first()).toHaveText("test3");
    });

    test("shows the ascending order", async ({ page }) => {
        await page.locator(".mx-name-drop_downSort1").click();
        await page.locator(".dropdown-list > li:nth-child(2)").click();
        await page.locator(".mx-name-drop_downSort1").locator(".btn").first().click();
        await page.locator(".mx-name-drop_downSort1").locator(".btn").first().click();
        await expect(page.locator(".mx-name-gallery1").locator(".widget-gallery-item").first()).toHaveText("test");
    });
});

test.describe("a11y testing:", () => {
    test("checks accessibility violations", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag21aa"])
            .exclude(".mx-name-navigationTree3")
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
