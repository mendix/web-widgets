import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Badge different data types", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/dataTypes");
    });

    test.describe("type: badge", () => {
        test("displays correctly string data", async ({ page }) => {
            const badgeButton = ".mx-name-badgeString";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("string type");
        });

        test("displays correctly integer data", async ({ page }) => {
            const badgeButton = ".mx-name-badgeInteger";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("987");
        });

        test("displays correctly long data", async ({ page }) => {
            const badgeButton = ".mx-name-badgeLong";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("123456789012345678");
        });

        test("displays correctly decimal data", async ({ page }) => {
            const badgeButton = ".mx-name-badgeDecimal";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("0.56");
        });

        test("displays correctly enum data", async ({ page }) => {
            const badgeButton = ".mx-name-badgeEnum";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("C Success");
        });
    });

    test.describe("type: label", () => {
        test("displays correctly string data", async ({ page }) => {
            const badgeButton = ".mx-name-labelString";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("string type");
        });

        test("displays correctly integer data", async ({ page }) => {
            const badgeButton = ".mx-name-labelInteger";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("987");
        });

        test("displays correctly long data", async ({ page }) => {
            const badgeButton = ".mx-name-labelLong";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("123456789012345678");
        });

        test("displays correctly decimal data", async ({ page }) => {
            const badgeButton = ".mx-name-labelDecimal";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("0.56");
        });

        test("displays correctly enum data", async ({ page }) => {
            const badgeButton = ".mx-name-labelEnum";
            await expect(page.locator(badgeButton)).toBeVisible();
            await expect(page.locator(badgeButton)).toContainText("C Success");
        });
    });
});
