import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Mapbox Maps", () => {
    test.describe("rendering", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/mapbox-static");
            await page.waitForLoadState("networkidle");
        });

        test("compares with a screenshot baseline and checks if basemap is correct", async ({ page }) => {
            const mapElement = await page.locator(".widget-maps");
            await expect(mapElement).toBeVisible();
            await expect(mapElement).toHaveScreenshot("mapboxMaps.png", { maxDiffPixels: 4000 });
        });
    });

    test.describe("mixed rendering", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/mapbox");
            await page.waitForLoadState("networkidle");
        });

        test("checks the rendering", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.locator(".leaflet-marker-icon");
            await expect(markers).toHaveCount(3);
        });
    });

    test.describe("static locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/mapbox-static");
            await page.waitForLoadState("networkidle");
        });

        test("checks the rendering", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page, browserName }) => {
            test.skip(browserName === "firefox", "Skipped for Firefox browser");
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.locator(".leaflet-marker-icon");
            await expect(markers).toHaveCount(1);
        });
    });

    test.describe("datasource locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/mapbox-datasource");
            await page.waitForLoadState("networkidle");
        });

        test("checks the rendering", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page, browserName }) => {
            test.skip(browserName === "firefox", "Skipped for Firefox browser");
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.locator(".leaflet-marker-icon");
            await expect(markers).toHaveCount(2);
        });
    });

    test.describe("on click", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/mapbox-onclick");
            await page.waitForLoadState("networkidle");
        });

        test("should click on first marker", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const firstMarker = page.getByRole("button", { name: "Marker" });
            await firstMarker.click();
            await firstMarker.click();
            const modalBody = await page.locator(".modal-body.mx-dialog-body");
            await expect(modalBody).toBeVisible();
            const modalText = await modalBody.textContent();
            await expect(modalText).toContain("Clicked on static marker");
        });
    });
});
