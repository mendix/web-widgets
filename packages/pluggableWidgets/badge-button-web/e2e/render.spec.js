import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("BadgeButton", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("displays correctly dynamic data", async ({ page }) => {
        await expect(page.locator(".mx-name-badgeButtonDynamic")).toBeVisible();
        await expect(page.locator(".mx-name-badgeButtonDynamic .widget-badge-button-text")).toContainText("Button");
        await expect(page.locator(".mx-name-badgeButtonDynamic .badge")).toContainText("New");
    });

    test("updates text value", async ({ page, browserName }) => {
        if (browserName !== "firefox") {
            await page.locator(".mx-name-textBox1 input").fill("\u0003\u0003\u0003"); // Clear input value
        }
        await page.locator(".mx-name-textBox1 input").fill("Newer");
        await page.locator(".mx-name-textBox1").locator(".control-label").click();
        await expect(page.locator(".mx-name-badgeButtonDynamic")).toBeVisible();
        await expect(page.locator(".mx-name-badgeButtonDynamic .widget-badge-button-text")).toContainText("Button");
        await expect(page.locator(".mx-name-badgeButtonDynamic .badge")).toContainText("Newer");
    });

    test("compares with a screenshot baseline and checks if all badge buttons elements are rendered as expected", async ({
        page
    }) => {
        await expect(page.locator(".mx-name-badgeButtonDynamic")).toBeVisible();
        await expect(page.locator(".mx-name-badgeButtonDynamic")).toHaveScreenshot("badgeButtonPageContent.png");
    });
});
