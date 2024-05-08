import { test, expect } from "@playwright/test";

test.describe("BadgeButton on click", () => {
    test.describe("call microflow", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/events");
        });

        test("displays a dialog", async ({ page }) => {
            await expect(page.locator(".mx-name-badgeButtonCallMicroflow")).toBeVisible();
            await page.locator(".mx-name-badgeButtonCallMicroflow").click();
            await expect(page.locator(".mx-dialog-body")).toContainText("Microflow Successfully Called With badge New");
        });
    });

    test.describe("call nanoflow", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/events");
        });

        test("displays a dialog", async ({ page }) => {
            await expect(page.locator(".mx-name-badgeButtonCallNanoflow")).toBeVisible();
            await page.locator(".mx-name-badgeButtonCallNanoflow").click();
            await expect(page.locator(".mx-dialog-body")).toContainText("Nanoflow called");
        });
    });

    test.describe("open page", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/events");
        });

        test("opens a page", async ({ page }) => {
            await expect(page.locator(".mx-name-badgeButtonShowPage")).toBeVisible();
            await page.locator(".mx-name-badgeButtonShowPage").click();
            await expect(page.locator(".mx-name-pageTitle1")).toContainText("ClickedPage");
        });

        test("opens modal popup page", async ({ page }) => {
            await expect(page.locator(".mx-name-badgeButtonShowPopupPage")).toBeVisible();
            await page.locator(".mx-name-badgeButtonShowPopupPage").click();
            await expect(page.locator(".mx-name-pageTitle1")).toContainText("ModalPopupPage");
        });
    });

    test.describe("close page", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/events");
        });

        test("closes a page", async ({ page }) => {
            await expect(page.locator(".mx-name-openClosePage")).toBeVisible();
            await page.locator(".mx-name-openClosePage").click();
            await expect(page.locator(".mx-name-badgeButtonClosePage")).toBeVisible();
            await page.locator(".mx-name-badgeButtonClosePage").click();
            await expect(page.locator(".mx-name-pageTitle1")).toContainText("Events");
        });
    });
});
