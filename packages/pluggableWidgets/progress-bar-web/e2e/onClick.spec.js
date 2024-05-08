import { test, expect } from "@playwright/test";

test.describe("Progress Bar on click", () => {
    test("should call Microflow", async ({ page }) => {
        await page.goto("/path/to/your/app");
        await page.locator(".mx-name-onClickMicroflow").click();
        const elementText = await page.locator(".mx-name-onClickMicroflow").textContent();
        await expect(page.locator(".modal-dialog .progress-bar")).toHaveText(elementText);
    });

    test("should call Nanoflow", async ({ page }) => {
        await page.goto("/path/to/your/app");
        await page.locator(".mx-name-onClickNanoflow").click();
        const elementText = await page.locator(".mx-name-NewEditTextBox .form-control-static").textContent();
        await expect(page.locator(".mx-name-onClickNanoflow")).toHaveText(elementText);
    });

    test("should Open Full Page", async ({ page }) => {
        await page.goto("/path/to/your/app");
        await page.locator(".mx-name-onClickOpenFullPage").click();
        const elementText = await page.locator(".mx-name-onClickOpened").textContent();
        await expect(page.locator(".mx-name-onClickOpenFullPage")).toHaveText(elementText);
    });

    test("should Open Popup Page", async ({ page }) => {
        await page.goto("/path/to/your/app");
        await page.locator(".mx-name-onClickOpenPopupPage").click();
        const elementText = await page.locator(".mx-name-onClickOpened").textContent();
        await expect(page.locator(".mx-name-onClickOpenPopupPage")).toHaveText(elementText);
    });

    test("should Open Blocking Popup Page", async ({ page }) => {
        await page.goto("/path/to/your/app");
        await page.locator(".mx-name-onClickOpenBlockingPopupPage").click();
        const elementText = await page.locator(".mx-name-onClickOpened").textContent();
        await expect(page.locator(".mx-name-onClickOpenBlockingPopupPage")).toHaveText(elementText);
    });
});
