import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("BadgeButton different views", () => {
    test.describe("listen to grid", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/listenToGrid");
            await waitForMendixApp(page);
        });

        test("displays correctly when listening a data grid", async ({ page }) => {
            await page.locator(".mx-name-grid1 [role='gridcell']").first().click();
            await expect(page.locator(".mx-name-badgeButtonListenToGrid")).toBeVisible();
            await expect(page.locator(".mx-name-badgeButtonListenToGrid .widget-badge-button-text")).toContainText(
                "Button"
            );
            await expect(page.locator(".mx-name-badgeButtonListenToGrid .badge")).toContainText("New");
        });
    });

    test.describe("listview", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/listView");
            await waitForMendixApp(page);
        });

        test("displays correctly in a list view", async ({ page }) => {
            const badgeButton = page.locator(".mx-name-badgeButtonListView").first();
            await expect(badgeButton).toBeVisible();
            await expect(badgeButton.locator(".widget-badge-button-text")).toContainText("Button");
            await expect(badgeButton.locator(".badge")).toContainText("New");
        });

        test("displays a widget in every list view item", async ({ page }) => {
            const items = page.locator(".mx-name-listView1").getByRole("listitem");
            await expect(items.first()).toBeVisible();
            const itemCount = await items.count();
            expect(itemCount).toBeGreaterThan(1);
            await expect(page.locator(".mx-name-badgeButtonListView")).toHaveCount(itemCount);
        });
    });

    test.describe("gallery", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/templateGrid");
            await waitForMendixApp(page);
        });

        test("displays correctly in a gallery", async ({ page }) => {
            const badgeButton = page.locator(".mx-name-badgeButtonTemplateGrid").first();
            await expect(badgeButton).toBeVisible();
            await expect(badgeButton.locator(".widget-badge-button-text")).toContainText("Button");
            await expect(badgeButton.locator(".badge")).toContainText("New");
        });

        test("displays a widget in every gallery item", async ({ page }) => {
            const items = page.locator(".mx-name-gallery1 .widget-gallery-item");
            await expect(items.first()).toBeVisible();
            const itemCount = await items.count();
            expect(itemCount).toBeGreaterThan(1);
            await expect(page.locator(".mx-name-badgeButtonTemplateGrid")).toHaveCount(itemCount);
        });
    });

    test.describe("tab container", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("p/tabContainer");
            await waitForMendixApp(page);
        });

        test("displays correctly in default tab", async ({ page }) => {
            const badgeButton = page.locator(".mx-name-badgeButtonTabContainer").first();
            await expect(badgeButton).toBeVisible();
            await expect(badgeButton.locator(".widget-badge-button-text")).toContainText("Button");
            await expect(badgeButton.locator(".badge")).toContainText("New");
        });

        test("displays correctly in second tab", async ({ page }) => {
            await page.locator(".mx-name-tabPage2").click();
            const badgeButton = page.locator(".mx-name-badgeButtonTabContainer2").first();
            await expect(badgeButton).toBeVisible();
            await expect(badgeButton.locator(".widget-badge-button-text")).toContainText("Button");
            await expect(badgeButton.locator(".badge")).toContainText("New");
        });
    });
});
