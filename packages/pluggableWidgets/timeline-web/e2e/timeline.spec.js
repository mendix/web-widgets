import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("timeline-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test.describe("option: basic", () => {
        test("compares with a screenshot baseline and checks if all timeline elements are rendered as expected", async ({
            page
        }) => {
            await page.locator(".mx-name-basicTimelinePage").click();
            await expect(page.locator(".mx-name-timelineGrids")).toBeVisible();
            await expect(page.locator(".mx-name-timelineGrids")).toHaveScreenshot(`timelineBasic.png`, {
                threshold: 0.2
            });
        });

        test("shows a message when event onclick is called", async ({ page }) => {
            await page.locator(".mx-name-basicTimelinePage").click();
            await page.locator(".mx-name-timelineBasic .clickable").first().click();
            await expect(page.locator(".modal-dialog .modal-body")).toBeVisible();
            await expect(page.locator(".modal-dialog .modal-body")).toHaveText(/Event called/);
        });
    });

    test.describe("option: custom", () => {
        test("compares with a screenshot baseline and checks if all custom timeline elements are rendered as expected", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-customTimelineLayoutGrid")).toBeVisible();
            await expect(page.locator(".mx-name-customTimelineLayoutGrid")).toHaveScreenshot(`timelineCusto.png`, {
                threshold: 0.2
            });
        });

        test("shows a message when event onclick is called", async ({ page }) => {
            await page.locator(".mx-name-timelineCustom .mx-name-clickMeTitle").first().click();
            await expect(page.locator(".modal-dialog .modal-body")).toBeVisible();
            await expect(page.locator(".modal-dialog .modal-body")).toHaveText(/Event called/);
        });
    });
});
