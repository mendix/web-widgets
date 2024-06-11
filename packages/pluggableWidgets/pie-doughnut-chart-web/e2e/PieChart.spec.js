import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("pie-doughnut-chart-web", () => {
    test.describe("pie color", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
            await page.waitForLoadState("networkidle");
        });

        test(
            "renders pie chart with custom color and compares with a screenshot baseline",
            async ({ page }) => {
                const containerSliceColor = await page.locator(".mx-name-containerSliceColor");
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
            await page.waitForLoadState("networkidle");
        });

        test(
            "renders pie chart with pie format and compares with a screenshot baseline",
            async ({ page }) => {
                const containerPieFormat = await page.locator(".mx-name-containerPieFormat");
                await containerPieFormat.scrollIntoViewIfNeeded();
                await expect(containerPieFormat).toHaveScreenshot("pieChartPieFormat.png", { threshold: 0.5 });
            },
            { retry: 3 }
        );

        test("renders pie chart with doughnut format and compares with a screenshot baseline", async ({ page }) => {
            const containerDoughnutFormat = await page.locator(".mx-name-containerDoughnutFormat");
            await containerDoughnutFormat.scrollIntoViewIfNeeded();
            await expect(containerDoughnutFormat).toHaveScreenshot("pieChartDoughnutFormat.png", { threshold: 0.5 });
        });
    });
});
