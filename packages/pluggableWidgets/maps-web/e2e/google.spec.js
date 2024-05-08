import { test, expect } from "@playwright/test";

test.describe("Google Maps", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("compares with a screenshot baseline and checks if basemap is correct", async ({ page }) => {
        const mapsElement = await page.$(".widget-maps");
        await expect(mapsElement).toBeVisible();
        await expect(mapsElement).toHaveScreenshot(`googleMaps.png`);
    });

    test("checks the rendering", async ({ page }) => {
        const googleMapsElement = await page.$(".widget-google-maps");
        await expect(googleMapsElement).toBeVisible();
    });

    test("check the number of locations", async ({ page }) => {
        const googleMapsElement = await page.$(".widget-google-maps");
        await expect(googleMapsElement).toBeVisible();
        const locationImages = await page.$$("img[src*='gstatic.com/mapfiles'][src*='poi']");
        await expect(locationImages).toHaveLength(3);
    });

    test.describe("static locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/google-static");
        });

        test("checks the rendering", async ({ page }) => {
            const googleMapsElement = await page.$(".widget-google-maps");
            await expect(googleMapsElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const googleMapsElement = await page.$(".widget-google-maps");
            await expect(googleMapsElement).toBeVisible();
            const locationImages = await page.$$("img[src*='gstatic.com/mapfiles'][src*='poi']");
            await expect(locationImages).toHaveLength(1);
        });
    });

    test.describe("datasource locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/google-datasource");
        });

        test("checks the rendering", async ({ page }) => {
            const googleMapsElement = await page.$(".widget-google-maps");
            await expect(googleMapsElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const googleMapsElement = await page.$(".widget-google-maps");
            await expect(googleMapsElement).toBeVisible();
            const locationImages = await page.$$("img[src*='gstatic.com/mapfiles'][src*='poi']");
            await expect(locationImages).toHaveLength(2);
        });
    });
});
