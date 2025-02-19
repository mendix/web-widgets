import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("gallery-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test.describe("capabilities: sorting", () => {
        test("applies the default sort order from the data source option", async ({ page }) => {
            await expect(page.locator(".mx-name-gallery1")).toBeVisible();
            await expect(page.locator(".mx-name-gallery1")).toHaveScreenshot(`galleryContent.png`, 0.1);
        });

        test("changes order of data choosing another option in the dropdown sort", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const dropdownSort = ".mx-name-drop_downSort2 input";

            await page.locator(dropdownSort).first().click();
            await page.locator("[role=menuitem]", { hasText: "Age" }).click();
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryDropdownSort.png`, 0.1);
        });
    });

    test.describe("capabilities: filtering", () => {
        test("filters by text", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const textFilter = ".mx-name-gallery1 .form-control";

            await page.locator(textFilter).first().fill("Leo");
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryTextFilter.png`, 0.1);
        });

        test("filters by number", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const textFilter = ".mx-name-gallery1 .form-control";

            await page.locator(textFilter).nth(1).fill("32");
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryNumberFilter.png`, 0.1);
        });

        test("filters by date", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const textFilter = ".mx-name-gallery1 .form-control";

            await page.locator(textFilter).nth(3).fill("10/10/1986");
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryDateFilter.png`, 0.1);
        });

        test("filters by enum (dropdown)", async ({ page }) => {
            const gallery = ".mx-name-gallery1";
            const dropdown = ".mx-name-gallery1 .mx-name-drop_downFilter1";

            await page.locator(dropdown).first().click();
            await page.locator(".widget-dropdown-filter-menu-slot > ul > li").nth(4).click();
            await expect(page.locator(gallery)).toHaveScreenshot(`galleryDropdownFilter.png`, 0.1);
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
            await page.waitForLoadState("networkidle");
        });

        test("checks accessibility violations", async ({ page }) => {
            await page.locator(".mx-name-gallery1").waitFor();
            const accessibilityScanResults = await new AxeBuilder({ page })
                .include(".mx-name-gallery1")
                .withTags(["wcag21aa"])
                .exclude(".mx-name-navigationTree3")
                .analyze();

            expect(accessibilityScanResults.violations).toEqual([]);
        });
    });
});
