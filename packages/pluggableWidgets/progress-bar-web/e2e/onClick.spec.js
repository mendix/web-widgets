import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("Progress Bar on click", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/eventOnClick");
        await waitForMendixApp(page);
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
