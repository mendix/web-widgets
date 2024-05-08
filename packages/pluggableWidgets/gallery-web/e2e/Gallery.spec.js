import { test, expect } from "@playwright/test";

test.describe("gallery-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("capabilities: sorting", () => {
        test("applies the default sort order from the data source option", async ({ page }) => {
            await expect(page.locator(".mx-name-gallery1")).toBeVisible();
            await expect(page.locator(".mx-name-gallery1")).toHaveScreenshot(`galleryContent`, 0.1);
        });

        test("changes order of data choosing another option in the dropdown sort", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const dropdownSort = ".mx-name-drop_downSort2 input";

            await page.locator(dropdownSort).first().click();
            await page.locator("[role=menuitem]", { hasText: "Age" }).click();
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryDropdownSort`, 0.1);
        });
    });

    test.describe("capabilities: filtering", () => {
        test("filters by text", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const textFilter = ".mx-name-gallery1 .form-control";

            await page.locator(textFilter).first().fill("Leo");
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryTextFilter`, 0.1);
        });

        test("filters by number", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const textFilter = ".mx-name-gallery1 .form-control";

            await page.locator(textFilter).nth(1).fill("32");
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryNumberFilter`, 0.1);
        });

        test("filters by date", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const textFilter = ".mx-name-gallery1 .form-control";

            await page.locator(textFilter).nth(3).fill("10/10/1986");
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryDateFilter`, 0.1);
        });

        test("filters by enum (dropdown)", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const dropdown = ".mx-name-gallery1 .mx-name-drop_downFilter1 input";

            await page.locator(dropdown).first().click();
            await page.locator(".dropdown-content li").nth(4).click();
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryDropdownFilter`, 0.1);
        });
    });

    test.describe("capabilities: onClick action", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
        });

        test("check the context", async ({ page }) => {
            const textFilter = ".mx-name-gallery1 .form-control";
            const galleryItem = ".mx-name-gallery1 .widget-gallery-item";
            const popUpElement = ".mx-dialog-body > p";

            await page.locator(textFilter).first().fill("Ana");

            await page.locator(galleryItem).first().click();

            const context = "You've clicked at Ana Carol's face.";
            await expect(page.locator(popUpElement)).toHaveText(context);
        });
    });

    test.describe("a11y testing:", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
        });

        test("checks accessibility violations", async ({ page }) => {
            const snapshot = await page.accessibility.snapshot({
                rules: [
                    { id: "aria-required-children", reviewOnFail: true },
                    { id: "label", reviewOnFail: true },
                    { id: "aria-roles", reviewOnFail: true },
                    { id: "button-name", reviewOnFail: true },
                    { id: "duplicate-id-active", reviewOnFail: true },
                    { id: "aria-allowed-attr", reviewOnFail: true }
                ]
            });

            // Test the widget at initial load
            const gallerySelector = ".mx-name-gallery1";
            const gallerySnapshot = await page.accessibility.snapshot({
                root: await page.locator(gallerySelector).elementHandle(),
                runOnly: {
                    type: "tag",
                    values: ["wcag2a"]
                }
            });

            expect(snapshot.violations).toEqual([]);
            expect(gallerySnapshot.violations).toEqual([]);
        });
    });
});
