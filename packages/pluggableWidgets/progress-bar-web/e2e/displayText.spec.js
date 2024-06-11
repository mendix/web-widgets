import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Progress Bar", () => {
    test("should render attribute text", async ({ page }) => {
        await page.goto("p/displayAttributeText");

        const value = await page.inputValue(".mx-name-displayText .form-control");
        await expect(page.locator(".mx-name-maximumValueAttribute")).toHaveText(value);
        await expect(page.locator(".mx-name-progressBarStatic")).toHaveText(value);
        await expect(page.locator(".mx-name-progressAttribute")).toHaveText(value);
    });

    test("should render no text", async ({ page }) => {
        await page.goto("p/displayNone");

        await expect(page.locator(".mx-name-progressBar1")).toHaveText("");
        await expect(page.locator(".mx-name-progressBar2")).toHaveText("");
        await expect(page.locator(".mx-name-progressBar3")).toHaveText("");
    });

    test("should display static value", async ({ page }) => {
        await page.goto("p/displayStaticText");

        await expect(page.locator(".mx-name-progressBar1")).toHaveText("Static text 1");
        await expect(page.locator(".mx-name-progressBar2")).toHaveText("Static text 2");
        await expect(page.locator(".mx-name-progressBar3")).toHaveText("Static text 3");
    });

    test("should display percentage", async ({ page }) => {
        await page.goto("p/displayPercentage");

        await expect(page.locator(".mx-name-progressBar1")).toHaveText("45%");
        await expect(page.locator(".mx-name-progressBar2")).toHaveText("67%");
        await expect(page.locator(".mx-name-progressBar3")).toHaveText("0%");
    });

    test("should display value", async ({ page }) => {
        await page.goto("p/displayValue");

        await expect(page.locator(".mx-name-progressBar1")).toHaveText("45");
        await expect(page.locator(".mx-name-progressBar2")).toHaveText("67");
        await expect(page.locator(".mx-name-progressBar3")).toHaveText("0");
    });
});
