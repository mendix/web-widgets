import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("Here Maps", () => {
    test.describe("rendering", () => {
        test("compares with a screenshot baseline and checks if basemap is correct", async ({ page }) => {
            await page.goto("p/here-static");
            await waitForMendixApp(page);
            const mapElement = await page.locator(".widget-maps");
            await expect(mapElement).toBeVisible();
            await expect(mapElement).toHaveScreenshot("hereMaps.png", { maxDiffPixels: 4000 });
        });
    });

    test.describe("mixed rendering", () => {
        test("checks the rendering", async ({ page }) => {
            await page.goto("p/here");
            await waitForMendixApp(page);
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            await page.goto("p/here");
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.locator(".leaflet-marker-icon");
            await expect(markers).toHaveCount(3);
        });
    });

    test.describe("static locations", () => {
        test("checks the rendering", async ({ page }) => {
            await page.goto("p/here-static");
            await waitForMendixApp(page);
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page, browserName }) => {
            test.skip(browserName === "firefox", "Skipped for Firefox browser");
            await page.goto("p/here-static");
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.locator(".leaflet-marker-icon");
            await expect(markers).toHaveCount(1);
        });
    });

    test.describe("datasource locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/here-datasource");
            await waitForMendixApp(page);
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
            await page.goto("p/here-onclick");
            await waitForMendixApp(page);
        });

        test("should click on first marker", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const firstMarker = await page.locator(".leaflet-marker-icon").first();
            await firstMarker.click();
            await firstMarker.click();
            const modalBody = await page.locator(".modal-body.mx-dialog-body");
            await expect(modalBody).toBeVisible();
            const modalText = await modalBody.textContent();
            await expect(modalText).toContain("Clicked on static marker");
        });
    });
});
