import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("Google Maps", () => {
    test.skip(true, "Google Maps tests disabled - requires API keys");
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
    });

    test("renders basemap with markers", async ({ page }) => {
        const $mapsElement = page.locator(".widget-google-maps");
        await expect($mapsElement).toBeVisible();
        const canvas = $mapsElement.locator("canvas, .gm-style > div");
        await expect(canvas.first()).toBeVisible();
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
