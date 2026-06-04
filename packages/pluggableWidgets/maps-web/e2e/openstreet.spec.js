import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("OpenStreet Maps", () => {
    test.skip(true, "OpenStreet Maps tests disabled - requires Google Geocoding API key");
    test.describe("rendering", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm-static");
            await waitForMendixApp(page);
        });

        test("compares with a screenshot baseline and checks if basemap is correct", async ({ page }) => {
            const mapElement = await page.locator(".widget-maps");
            await expect(mapElement).toBeVisible();
            await expect(mapElement).toHaveScreenshot("osmMaps.png");
        });
    });

    test.describe("mixed rendering", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm");
            await waitForMendixApp(page);
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
            await page.goto("p/osm-static");
            await waitForMendixApp(page);
        });

        test("checks the rendering", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.locator(".leaflet-marker-icon");
            await expect(markers).toHaveCount(1);
        });
    });

    test.describe("datasource locations", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm-datasource");
            await waitForMendixApp(page);
        });

        test("checks the rendering", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
        });

        test("check the number of locations", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const markers = await page.locator(".leaflet-marker-icon");
            await expect(markers).toHaveCount(2);
        });
    });

    test.describe("on click", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm-onclick");
            await waitForMendixApp(page);
        });

        test("should click on first marker", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();
            const firstMarker = await page.locator(".leaflet-marker-icon").first();
            await firstMarker.click();
            await firstMarker.click();
            const modalBody = await page.locator(".modal-body.mx-dialog-body p");
            await expect(modalBody).toBeVisible();
            const modalText = await modalBody.textContent();
            await expect(modalText).toContain("Clicked on static marker");
        });
    });

    test.describe("dynamic markers update", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm-dynamic");
            await waitForMendixApp(page);
        });

        test("should display initial markers, update them, and verify new markers", async ({ page }) => {
            const mapElement = await page.locator(".widget-leaflet-maps");
            await expect(mapElement).toBeVisible();

            // Step 2: Check initial number of markers (expected 3)
            const initialMarkers = await page.locator(".leaflet-marker-icon");
            await expect(initialMarkers).toHaveCount(3);

            // Step 3: Click on each marker and verify dialog titles
            const expectedInitialTitles = ["Marker A", "Marker B", "Marker C"];

            for (let i = 0; i < expectedInitialTitles.length; i++) {
                const marker = initialMarkers.nth(i);
                await marker.click();
                await marker.click();

                const modalBody = await page.locator(".modal-body.mx-dialog-body p");
                await expect(modalBody).toBeVisible();
                const modalText = await modalBody.textContent();
                await expect(modalText).toContain(expectedInitialTitles[i]);

                // Close modal
                const closeButton = await page.locator(
                    ".modal-header button.close, .mx-dialog button[aria-label='Close']"
                );
                if (await closeButton.isVisible()) {
                    await closeButton.click();
                }
            }

            // Step 4: Click "Update markers" button
            const updateButton = await page.locator("button:has-text('Update markers')");
            await expect(updateButton).toBeVisible();
            await updateButton.click();

            // Wait for markers to update
            await page.waitForTimeout(1000);

            // Step 5: Check updated number of markers (expected 2)
            const updatedMarkers = await page.locator(".leaflet-marker-icon");
            await expect(updatedMarkers).toHaveCount(2);

            // Step 3 (repeated): Click on each updated marker and verify different titles
            const expectedUpdatedTitles = ["Updated Marker 1", "Updated Marker 2"];

            for (let i = 0; i < expectedUpdatedTitles.length; i++) {
                const marker = updatedMarkers.nth(i);
                await marker.click();
                await marker.click();

                const modalBody = await page.locator(".modal-body.mx-dialog-body p");
                await expect(modalBody).toBeVisible();
                const modalText = await modalBody.textContent();
                await expect(modalText).toContain(expectedUpdatedTitles[i]);

                // Close modal
                const closeButton = await page.locator(
                    ".modal-header button.close, .mx-dialog button[aria-label='Close']"
                );
                if (await closeButton.isVisible()) {
                    await closeButton.click();
                }
            }
        });
    });
});

test.describe("OpenStreet Maps - No Google API", () => {
    test.describe("markers datasource change", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/osm-dynamic");
            await waitForMendixApp(page);
        });

        test("click on each marker and then update props", async ({ page }) => {
            const mapElement = await page.locator(".widget-maps");
            await expect(mapElement).toBeVisible();

            // Click marker to open Leaflet popup
            const markerA = page.locator(".leaflet-marker-icon").nth(0);
            const markerB = page.locator(".leaflet-marker-icon").nth(1);
            const markerC = page.locator(".leaflet-marker-icon").nth(2);

            // Click couple times to show tooltip
            await markerA.click();
            await markerB.click();
            // Check A
            await markerA.click();
            await expect(page.getByText("Marker A")).toBeVisible();
            // TODO: Fix on click action - title should be updated in input
            await expect(page.getByLabel("Marker title")).toHaveValue("Unknown");

            // Check B
            await markerB.click();
            await expect(page.getByText("Marker B")).toBeVisible();
            // TODO: Fix on click action - title should be updated in input
            await expect(page.getByLabel("Marker title")).toHaveValue("Unknown");

            // Check C
            await markerC.click();
            await expect(page.getByText("Marker B")).toBeVisible();
            // TODO: Fix on click action - title should be updated in input
            await expect(page.getByLabel("Marker title")).toHaveValue("Unknown");

            // Change marker set

            const codeField = page.getByLabel("code");
            await codeField.fill("2");
            await codeField.press("Enter");
            await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);

            const updatedMarkerA = page.locator(".leaflet-marker-icon").nth(0);
            const updatedMarkerB = page.locator(".leaflet-marker-icon").nth(1);

            // Click updated markers to open Leaflet popup
            await updatedMarkerB.click();

            // Check updated A
            await updatedMarkerA.click();
            await expect(page.getByText("Updated Marker 1")).toBeVisible();

            // Check updated B
            await updatedMarkerB.click();
            await expect(page.getByText("Updated Marker 2")).toBeVisible();
        });
    });
});
