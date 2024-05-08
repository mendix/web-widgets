import { test, expect } from "@playwright/test";

test.describe("pie-doughnut-chart-web", () => {
    test.beforeAll(async ({ browser }) => {
        await browser.newContext();
        await browser.newPage();
    });

    test.describe("pie color", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
            await page.setViewportSize({ width: 1280, height: 720 });
        });

        test(
            "renders pie chart with custom color and compares with a screenshot baseline",
            async ({ page }) => {
                const containerSliceColor = await page.$(".mx-name-containerSliceColor");
                await containerSliceColor.scrollIntoViewIfNeeded();
                await expect(containerSliceColor).toBeVisible({ timeout: 15000 });
                await containerSliceColor.scrollIntoViewIfNeeded();
                await expect(containerSliceColor).toHaveScreenshot("pieChartDefaultColor.png", { threshold: 0.5 });
            },
            { retry: 3 }
        );
    });

    test.describe("column format", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
            await page.setViewportSize({ width: 1280, height: 720 });
        });

        test(
            "renders pie chart with pie format and compares with a screenshot baseline",
            async ({ page }) => {
                const containerPieFormat = await page.$(".mx-name-containerPieFormat");
                await containerPieFormat.scrollIntoViewIfNeeded();
                await expect(containerPieFormat).toHaveScreenshot("pieChartPieFormat.png", { threshold: 0.5 });
            },
            { retry: 3 }
        );

        test("renders pie chart with doughnut format and compares with a screenshot baseline", async ({ page }) => {
            const containerDoughnutFormat = await page.$(".mx-name-containerDoughnutFormat");
            await containerDoughnutFormat.scrollIntoViewIfNeeded();
            await expect(containerDoughnutFormat).toHaveScreenshot("pieChartDoughnutFormat.png", { threshold: 0.5 });
        });
    });
});
