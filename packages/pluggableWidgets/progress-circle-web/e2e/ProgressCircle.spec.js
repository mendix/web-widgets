import { test, expect } from "@playwright/test";

test.describe("Progress Circle", () => {
    test("renders with a value", async ({ page }) => {
        await page.goto("p/Home");
        await expect(page.locator(".mx-name-progressCircleNegative")).toBeVisible();
        await expect(page.locator(".mx-name-progressCircleNegative .progressbar-text")).toHaveText("20%");
    });

    test("updates the progress percentage when the value is changed", async ({ page }) => {
        await page.goto("p/Playground");
        await expect(page.locator(".mx-name-progressCirclePercentage")).toBeVisible();
        await page.locator(".mx-name-textBoxProgress input").fill("67", { force: true });
        await page.locator(".mx-name-textBoxMaximumValue").click();
        await expect(page.locator(".mx-name-progressCirclePercentage .progressbar-text")).toHaveText("67%");
        await expect(page.locator(".mx-name-progressCircleValue .progressbar-text")).toHaveText("67");
        await expect(page.locator(".mx-name-progressCircleNoValue .progressbar-text")).toHaveText("");
        await expect(page.locator(".mx-name-progressCircleAttribute .progressbar-text")).toHaveText(
            "Working with an attribute"
        );
        await expect(page.locator(".mx-name-progressCircleStaticText .progressbar-text")).toHaveText("Static text");
        await expect(page.locator(".mx-name-progressCircleStaticTextAttributeDefined .progressbar-text")).toHaveText(
            "Static text"
        );
    });
});
