import { test, expect } from "@playwright/test";

test.describe("badge-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/callNanoflow");
    });

    test("should call nanoflow on click badge", async ({ page }) => {
        const badge = ".mx-name-badgeCallNanoflow";
        await expect(page.locator(badge)).toBeVisible();
        await page.locator(badge).click();

        const dialog = ".modal-body";
        await expect(page.locator(dialog)).toBeVisible();

        const data = ".form-control-static";
        await expect(page.locator(data)).toContainText("NewSuccess");
    });

    test("should call nanoflow on click label", async ({ page }) => {
        const badge = ".mx-name-labelCallNanoflow";
        await expect(page.locator(badge)).toBeVisible();
        await page.locator(badge).click();

        const dialog = ".modal-body";
        await expect(page.locator(dialog)).toBeVisible();

        const data = ".form-control-static";
        await expect(page.locator(data)).toContainText("NewSuccess");
    });
});
