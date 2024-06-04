import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Progress Bar on click", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/eventOnClick");
        await page.waitForLoadState("networkidle");
    });

    test("should call Microflow", async ({ page }) => {
        await page.locator(".mx-name-onClickMicroflow").click();
        await expect(page.locator(".mx-name-onClickMicroflow")).toBeVisible();
        const elementText = await page.locator(".mx-name-onClickMicroflow").textContent();
        await expect(page.locator(".modal-dialog .progress-bar")).toHaveText(elementText);
    });

    test("should call Nanoflow", async ({ page }) => {
        await page.locator(".mx-name-onClickNanoflow").click();
        await expect(page.locator(".mx-name-NewEditTextBox .form-control-static")).toBeVisible();
        const elementText = await page.locator(".mx-name-NewEditTextBox .form-control-static").textContent();
        await expect(page.locator(".mx-name-onClickNanoflow")).toHaveText(elementText);
    });

    test("should Open Full Page", async ({ page }) => {
        await page.locator(".mx-name-onClickOpenFullPage").click();
        await expect(page.locator(".mx-name-onClickOpened")).toBeVisible();
        const elementText = await page.locator(".mx-name-onClickOpened").textContent();
        await expect(page.locator(".mx-name-onClickOpenFullPage")).toHaveText(elementText);
    });

    test("should Open Popup Page", async ({ page }) => {
        await page.locator(".mx-name-onClickOpenPopupPage").click();
        await expect(page.locator(".mx-name-onClickOpened")).toBeVisible();
        const elementText = await page.locator(".mx-name-onClickOpened").textContent();
        await expect(page.locator(".mx-name-onClickOpenPopupPage")).toHaveText(elementText);
    });

    test("should Open Blocking Popup Page", async ({ page }) => {
        await page.locator(".mx-name-onClickOpenBlockingPopupPage").click();
        await expect(page.locator(".mx-name-onClickOpened")).toBeVisible();
        const elementText = await page.locator(".mx-name-onClickOpened").textContent();
        await expect(page.locator(".mx-name-onClickOpenBlockingPopupPage")).toHaveText(elementText);
    });
});
