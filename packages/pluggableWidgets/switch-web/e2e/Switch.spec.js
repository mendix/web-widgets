import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Switch", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("changes color when checked", async ({ page }) => {
        await expect(page.locator(".mx-name-switch1").first()).toBeVisible();
        await expect(page.locator(".mx-name-switch1 .widget-switch-btn-wrapper").first()).toHaveCSS(
            "background-color",
            "rgb(100, 189, 99)"
        );
    });

    test("is updated by an attribute", async ({ page }) => {
        await page.locator(".mx-name-radioButtons6 label").first().click();
        await expect(page.locator(".mx-name-switch2").first()).toBeVisible();
        await expect(page.locator(".mx-name-switch2 .widget-switch-btn-wrapper").first()).toHaveClass(/checked/);
        await expect(page.locator(".mx-name-switch2 .widget-switch-btn-wrapper").first()).toHaveAttribute(
            "aria-checked",
            "true"
        );
    });

    test("updates attribute when clicked", async ({ page }) => {
        await expect(page.locator(".mx-name-switch2").first()).toBeVisible();
        await page.locator(".mx-name-switch2 .widget-switch-btn-wrapper").first().click();
        await expect(page.locator(".mx-name-radioButtons6 input:checked")).toHaveValue("true");
    });

    test("opens popup when clicked", async ({ page }) => {
        await expect(page.locator(".mx-name-switch3").first()).toBeVisible();
        await page.locator(".mx-name-switch3 .widget-switch-btn-wrapper").first().click();
        await expect(page.locator(".mx-name-radioButtons7 input:checked")).toHaveValue("true");
        await expect(page.locator(".modal-dialog .modal-body")).toBeVisible();
        await expect(page.locator(".modal-dialog .modal-body")).toHaveText(/IT WORKS/);
    });
});
