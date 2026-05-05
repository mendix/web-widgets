import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

// Conditional flag added to skip these tests when running on react client, because those widgets aren't supported in the react client
test.skip(process.env.MODERN_CLIENT === true, () => {
    test.describe("BadgeButton different views", () => {
        test.describe("listen to grid", () => {
            test.beforeEach(async ({ page }) => {
                await page.goto("p/listenToGrid");
                await waitForMendixApp(page);
            });

            test("displays correctly when listening a data grid", async ({ page }) => {
                await expect(page.locator(".mx-name-badgeButtonListenToGrid")).toBeVisible();
                await page.locator(".mx-name-index-1").click();
                await expect(page.locator(".mx-name-badgeButtonListenToGrid .widget-badge-button-text")).toContainText(
                    "Button"
                );
            });
        });

        test.describe("listview", () => {
            test.beforeEach(async ({ page }) => {
                await page.goto("p/listView");
                await waitForMendixApp(page);
            });

            test("displays correctly in a list view", async ({ page }) => {
                await expect(page.locator(".mx-name-badgeButtonListView")).toBeVisible();
                await expect(
                    page.locator(".mx-name-badgeButtonListView >> nth=0 .widget-badge-button-text")
                ).toContainText("Button");
                await expect(page.locator(".mx-name-badgeButtonListView >> nth=0 .badge")).toContainText("New");
            });

            test("displays multiple widgets", async ({ page }) => {
                await expect(page.locator(".mx-name-badgeButtonListView")).toBeVisible();
                await expect(page.locator(".mx-name-badgeButtonListView")).toHaveCount(1);
            });
        });

        test.describe("template grid", () => {
            test.beforeEach(async ({ page }) => {
                await page.goto("p/templateGrid");
                await waitForMendixApp(page);
            });

            test("displays correctly in a template grid", async ({ page }) => {
                await expect(page.locator(".mx-name-badgeButtonTemplateGrid")).toBeVisible();
                await expect(
                    page.locator(".mx-name-badgeButtonTemplateGrid >> nth=0 .widget-badge-button-text")
                ).toContainText("Button");
                await expect(page.locator(".mx-name-badgeButtonTemplateGrid >> nth=0 .badge")).toContainText("New");
            });

            test("displays multiple widgets", async ({ page }) => {
                await expect(page.locator(".mx-name-badgeButtonTemplateGrid")).toBeVisible();
                await expect(page.locator(".mx-name-badgeButtonTemplateGrid")).toHaveCount(1);
                await expect(page.locator(".mx-templategrid-row")).toHaveCount(2);
            });
        });

        test.describe("tab container", () => {
            test.beforeEach(async ({ page }) => {
                await page.goto("p/tabContainer");
                await waitForMendixApp(page);
            });

            test("displays correctly in default tab", async ({ page }) => {
                await expect(page.locator(".mx-name-badgeButtonTabContainer")).toBeVisible();
                await expect(page.locator(".mx-name-badgeButtonTabContainer .widget-badge-button-text")).toContainText(
                    "Button"
                );
                await expect(page.locator(".mx-name-badgeButtonTabContainer .badge")).toContainText("New");
            });

            test("displays correctly in second tab", async ({ page }) => {
                await page.locator(".mx-name-tabPage2").click();
                await expect(page.locator(".mx-name-badgeButtonTabContainer2")).toBeVisible();
                await expect(page.locator(".mx-name-badgeButtonTabContainer2 .widget-badge-button-text")).toContainText(
                    "Button"
                );
                await expect(page.locator(".mx-name-badgeButtonTabContainer2 .badge")).toContainText("New");
            });
        });
    });
});
