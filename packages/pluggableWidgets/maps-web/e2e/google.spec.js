import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Google Maps", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("compares with a screenshot baseline and checks if basemap is correct", async ({ page }) => {
        const mapsElement = await page.locator(".widget-maps");
        await expect(mapsElement).toBeVisible();
        await expect(mapsElement).toHaveScreenshot(`googleMaps.png`, { maxDiffPixels: 4000 });
    });

    test("checks the rendering", async ({ page }) => {
        const googleMapsElement = await page.locator(".widget-google-maps");
        await expect(googleMapsElement).toBeVisible();
    });

    test("check the number of locations", async ({ page }) => {
        const googleMapsElement = await page.locator(".widget-google-maps");
        await expect(googleMapsElement).toBeVisible();
        const locationImages = await page.locator(".GMAMP-maps-pin-view");
        await expect(locationImages).toHaveCount(3);
    });

    test.describe("static locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/google-static");
        });

        test("checks the rendering", async ({ page }) => {
            const googleMapsElement = await page.locator(".widget-google-maps");
            await expect(googleMapsElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const googleMapsElement = await page.locator(".widget-google-maps");
            await expect(googleMapsElement).toBeVisible();
            const locationImages = await page.locator(".GMAMP-maps-pin-view");
            await expect(locationImages).toHaveCount(1);
        });
    });

    test.describe("datasource locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/google-datasource");
        });

        test("checks the rendering", async ({ page }) => {
            const googleMapsElement = await page.locator(".widget-google-maps");
            await expect(googleMapsElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const googleMapsElement = await page.locator(".widget-google-maps");
            await expect(googleMapsElement).toBeVisible();
            const locationImages = await page.locator(".GMAMP-maps-pin-view");
            await expect(locationImages).toHaveCount(2);
        });
    });
});
