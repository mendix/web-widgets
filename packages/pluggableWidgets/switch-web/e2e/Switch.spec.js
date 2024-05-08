import { test, expect } from "@playwright/test";

test.describe("Switch", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("changes color when checked", async ({ page }) => {
        await expect(page.locator(".mx-name-switch1")).toBeVisible();
        await expect(page.locator(".mx-name-switch1 .widget-switch-btn-wrapper")).toHaveCSS(
            "background-color",
            "rgb(100, 189, 99)"
        );
    });

    test("is updated by an attribute", async ({ page }) => {
        await page.locator(".mx-name-radioButtons6 label").first().click();
        await expect(page.locator(".mx-name-switch2")).toBeVisible();
        await expect(page.locator(".mx-name-switch2 .widget-switch-btn-wrapper")).toHaveClass(/checked/);
        await expect(page.locator(".mx-name-switch2 .widget-switch-btn-wrapper")).toHaveAttribute(
            "aria-checked",
            "true"
        );
    });

    test("updates attribute when clicked", async ({ page }) => {
        await expect(page.locator(".mx-name-switch2")).toBeVisible();
        await page.locator(".mx-name-switch2 .widget-switch-btn-wrapper").first().click();
        await expect(page.locator(".mx-name-radioButtons6 input:checked")).toHaveValue("true");
    });

    test("opens popup when clicked", async ({ page }) => {
        await expect(page.locator(".mx-name-switch3")).toBeVisible();
        await page.locator(".mx-name-switch3 .widget-switch-btn-wrapper").first().click();
        await expect(page.locator(".mx-name-radioButtons7 input:checked")).toHaveValue("true");
        await expect(page.locator(".modal-dialog .modal-body")).toBeVisible();
        await expect(page.locator(".modal-dialog .modal-body")).toHaveText("IT WORKS");
    });
});
