import { test, expect } from "@playwright/test";

test.describe("render method: text", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/arrow");
    });

    test("compares with a screenshot baseline and checks if tooltip arrow start is rendered as expected", async ({
        page
    }) => {
        await page.locator(".mx-name-actionButtonStart").focus();
        await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipArrowStart`, 0.1);
    });

    test("compares with a screenshot baseline and checks if tooltip arrow end is rendered as expected", async ({
        page
    }) => {
        await page.locator(".mx-name-actionButtonEnd").focus();
        await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipArrowEnd`, 0.1);
    });

    test("compares with a screenshot baseline and checks if tooltip arrow center is rendered as expected", async ({
        page
    }) => {
        await page.locator(".mx-name-actionButtonCenter").focus();
        await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipArrowCenter`, 0.1);
    });

    test("compares with a screenshot baseline and checks if tooltip position is rendered on top", async ({ page }) => {
        await page.goto("/p/position");
        await page.locator(".mx-name-actionButtonTop").focus();
        await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipPositionTop`, 0.1);
    });

    test("compares with a screenshot baseline and checks if tooltip position is rendered on left", async ({ page }) => {
        await page.goto("/p/position");
        await page.locator(".mx-name-actionButtonLeft").focus();
        await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipPositionLeft`, 0.1);
    });

    test("compares with a screenshot baseline and checks if tooltip position is rendered on right", async ({
        page
    }) => {
        await page.goto("/p/position");
        await page.locator(".mx-name-actionButtonRight").focus();
        await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipPositionRight`, 0.1);
    });

    test("compares with a screenshot baseline and checks if tooltip position is rendered on bottom", async ({
        page
    }) => {
        await page.goto("/p/position");
        await page.locator(".mx-name-actionButtonBottom").focus();
        await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipPositionBottom`, 0.1);
    });

    test("compares with a screenshot baseline and checks if tooltip position is flipped when it doesn't have space on the left", async ({
        page
    }) => {
        await page.goto("/p/position");
        await page.locator(".mx-name-actionButtonFlip").focus();
        await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipPositionFlipped`, 0.1);
    });

    test.describe("render method: custom", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/arrow");
        });

        test("verifies tooltip shown custom content and compares with a screenshot baseline", async ({ page }) => {
            await page.locator(".mx-name-navigationTree3-3").click();
            await page.locator(".mx-name-actionButtonCustom").focus();
            await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipCustom`, 0.1);
        });

        test("verifies if tooltip is opened on click", async ({ page }) => {
            await page.goto("/p/click");
            await page.locator(".mx-name-actionButtonClick").click();
            await expect(page.locator(".mx-scrollcontainer-center")).toHaveScreenshot(`tooltipClick`, 0.1);
        });
    });
});
