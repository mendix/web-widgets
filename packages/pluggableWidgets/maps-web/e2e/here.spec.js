import { test, expect } from "@playwright/test";

test.describe("Here Maps", () => {
    test.describe("rendering", () => {
        test("compares with a screenshot baseline and checks if basemap is correct", async ({ page }) => {
            await page.goto("p/here-static");
            const mapElement = await page.$(".widget-maps");
            await expect(mapElement).toBeVisible();
            await expect(mapElement).toHaveScreenshot("hereMaps.png", { threshold: 0.5 });
        });
    });

    test.describe("mixed rendering", () => {
        test("checks the rendering", async ({ page }) => {
            await page.goto("p/here");
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            await page.goto("p/here");
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.$$(".leaflet-marker-icon");
            await expect(markers).toHaveLength(3);
        });
    });

    test.describe("static locations", () => {
        test("checks the rendering", async ({ page }) => {
            await page.goto("p/here-static");
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page, browserName }) => {
            test.skip(browserName === "firefox", "Skipped for Firefox browser");
            await page.goto("p/here-static");
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.$$(".leaflet-marker-icon");
            await expect(markers).toHaveLength(1);
        });
    });

    test.describe("datasource locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/here-datasource");
        });

        test("checks the rendering", async ({ page }) => {
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page, browserName }) => {
            test.skip(browserName === "firefox", "Skipped for Firefox browser");
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.$$(".leaflet-marker-icon");
            await expect(markers).toHaveLength(2);
        });
    });

    test.describe("on click", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/here-onclick");
        });

        test("should click on first marker", async ({ page }) => {
            const mapElement = await page.$(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const firstMarker = (await page.$$(".leaflet-marker-icon"))[0];
            await firstMarker.click({ force: true });
            const modalBody = await page.$(".modal-body.mx-dialog-body");
            await expect(modalBody).toBeVisible();
            const modalText = await modalBody.textContent();
            await expect(modalText).toContain("Clicked on static marker");
        });
    });
});
