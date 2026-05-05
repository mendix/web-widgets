import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("Google Maps", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
    });

    test("compares with a screenshot baseline and checks if basemap is correct", async ({ page }) => {
        const $mapsElement = page.locator(".widget-google-maps");
        await expect($mapsElement).toBeVisible();
        await expect($mapsElement).toHaveScreenshot(`googleMaps.png`, {
            maxDiffPixels: 15000,
            threshold: 0.3,
            animations: "disabled"
        });
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
