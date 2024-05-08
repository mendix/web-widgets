import { test, expect } from "@playwright/test";

test.describe("dropdown-sort-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
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
        await page.initializeAccessibility();
        await page.setAccessibilityScannerOptions({
            //TODO: Skipped some rules as we still need to review them
            rules: [
                { id: "aria-required-children", reviewOnFail: true },
                { id: "label", reviewOnFail: true },
                { id: "aria-roles", reviewOnFail: true },
                { id: "button-name", reviewOnFail: true },
                { id: "duplicate-id-active", reviewOnFail: true },
                { id: "duplicate-id", reviewOnFail: true },
                { id: "aria-allowed-attr", reviewOnFail: true }
            ]
        });
        // Test the widget at initial load
        const snapshot = await page.accessibilitySnapshot({ root: ".mx-name-gallery1" });
        expect(snapshot).toMatchSnapshot("gallery-accessibility.txt", { threshold: 0.1 });
    });
});
