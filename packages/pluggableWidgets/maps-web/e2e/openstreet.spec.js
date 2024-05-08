import { test, expect } from "@playwright/test";

test.describe("OpenStreet Maps", () => {
    test.describe("rendering", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm-static");
        });

        test("compares with a screenshot baseline and checks if basemap is correct", async ({ page }) => {
            const mapElement = await page.$(".widget-maps");
            await expect(mapElement).toBeVisible();
            await expect(mapElement).toHaveScreenshot("osmMaps.png", { threshold: 0.5 });
        });
    });

    test.describe("mixed rendering", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm");
        });

        test("checks the rendering", async ({ page }) => {
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.$$(".leaflet-marker-icon");
            await expect(markers).toHaveLength(3);
        });
    });

    test.describe("static locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm-static");
        });

        test("checks the rendering", async ({ page }) => {
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.$$(".leaflet-marker-icon");
            await expect(markers).toHaveLength(1);
        });
    });

    test.describe("datasource locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm-datasource");
        });

        test("checks the rendering", async ({ page }) => {
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.$$(".leaflet-marker-icon");
            await expect(markers).toHaveLength(2);
        });
    });

    test.describe("on click", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm-onclick");
        });

        test("should click on first marker", async ({ page }) => {
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const firstMarker = (await page.$$(".leaflet-marker-icon"))[0];
            await firstMarker.click({ force: true });
            const modalBody = await page.$(".modal-body.mx-dialog-body p");
            await expect(modalBody).toBeVisible();
            const modalText = await modalBody.textContent();
            await expect(modalText).toContain("Clicked on static marker");
        });
    });
});
