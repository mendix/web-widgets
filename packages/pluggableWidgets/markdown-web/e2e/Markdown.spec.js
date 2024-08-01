import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("markdown-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test.describe("contents", () => {
        test("render basic markdown", async ({ page }) => {
            const markdown = page.locator(".mx-name-markdownViewer2");
            await expect(markdown).toBeVisible({ timeout: 10000 });
            await expect(markdown).toHaveScreenshot(`markdownBasic.png`);
        });

        test("render markdown tables", async ({ page }) => {
            await page.click(".mx-name-tabPage2");
            const markdown = page.locator(".mx-name-markdownViewer1");
            await expect(markdown).toBeVisible({ timeout: 10000 });
            await expect(markdown).toHaveScreenshot(`markdownTables.png`);
        });

        test("do not render inline HTML", async ({ page }) => {
            await page.click(".mx-name-tabPage3");
            const markdown = page.locator(".mx-name-markdownViewer3");
            await expect(markdown).toBeVisible({ timeout: 10000 });
            await expect(markdown).toHaveScreenshot(`markdownInlineHTML.png`);
        });

        test("render markdown lists", async ({ page }) => {
            await page.click(".mx-name-tabPage4");
            const markdown = page.locator(".mx-name-markdownViewer4");
            await expect(markdown).toBeVisible({ timeout: 10000 });
            await expect(markdown).toHaveScreenshot(`markdownLists.png`);
        });

        test("render using conditional visibility", async ({ page }) => {
            await page.click(".mx-name-tabPage5");
            await page.getByLabel("Yes").click();
            const markdown = page.locator(".mx-name-markdownViewer5");
            await expect(markdown).toBeVisible({ timeout: 10000 });
            await expect(markdown).toHaveScreenshot(`markdownConditionalVisibility.png`);
        });
    });
});
