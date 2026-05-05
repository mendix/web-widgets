import { expect, test } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";
import AxeBuilder from "@axe-core/playwright";

test.describe("datagrid-web selection", async () => {
    test("applies checkbox single selection checkbox", async ({ page }) => {
        const singleSelectionCheckbox = page.locator(".mx-name-dgSingleSelectionCheckbox");

        await page.goto("/p/single-selection");
        await waitForMendixApp(page);
        await expect(singleSelectionCheckbox).toBeVisible();
        await singleSelectionCheckbox.locator("input").first().click();
        await expect(page).toHaveScreenshot(`datagridSingleSelectionCheckbox.png`);
    });

    test("applies checkbox single selection row click", async ({ page }) => {
        const singleSelectionRowClick = page.locator(".mx-name-dgSingleSelectionRowClick");

        await page.goto("/p/single-selection");
        await waitForMendixApp(page);
        await expect(singleSelectionRowClick).toBeVisible();
        await singleSelectionRowClick
            .locator(".td")
            .first()
            .click({ modifiers: ["Shift"] });
        await expect(page).toHaveScreenshot(`datagridSingleSelectionRowClick.png`);
    });

    test("applies checkbox multi selection checkbox", async ({ page }) => {
        const multiSelectionCheckbox = page.locator(".mx-name-dgMultiSelectionCheckbox");

        await page.goto("/p/multi-selection");
        await waitForMendixApp(page);
        await expect(multiSelectionCheckbox).toBeVisible();
        await multiSelectionCheckbox.locator("input").first().click();
        await multiSelectionCheckbox.locator("input").nth(1).click();
        await expect(page).toHaveScreenshot(`datagridMultiSelectionCheckbox.png`);
    });

    test("applies checkbox multi selection row click", async ({ page }) => {
        const multiSelectionRowClick = page.locator(".mx-name-dgMultiSelectionRowClick");

        await page.goto("/p/multi-selection");
        await waitForMendixApp(page);
        await expect(multiSelectionRowClick).toBeVisible();
        await multiSelectionRowClick.locator(".td").first().click({ force: true });
        await multiSelectionRowClick
            .locator(".td")
            .nth(4)
            .click({ modifiers: ["Shift"] });
        await expect(page).toHaveScreenshot(`datagridMultiSelectionRowClick.png`);
    });

    test("checks single selection accessibility with sr-only text", async ({ page }) => {
        await page.goto("/p/single-selection");
        await waitForMendixApp(page);

        const singleSelectionCheckbox = page.locator(".mx-name-dgSingleSelectionCheckbox");
        await singleSelectionCheckbox.waitFor();

        // Verify sr-only text is present in the selection column header
        const srOnlyText = singleSelectionCheckbox.locator(".widget-datagrid-col-select .sr-only");
        await expect(srOnlyText).toHaveText(/Select single row/i);

        // Verify sr-only text is not visible but accessible
        await expect(srOnlyText).toBeAttached();
        const isHidden = await srOnlyText.evaluate(el => {
            const style = window.getComputedStyle(el);
            return (
                style.position === "absolute" && (style.width === "1px" || style.clip === "rect(0px, 0px, 0px, 0px)")
            );
        });
        expect(isHidden).toBe(true);

        // Run accessibility scan
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag21aa"])
            .include(".mx-name-dgSingleSelectionCheckbox")
            .exclude(".mx-name-navigationTree3")
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("checks accessibility violations", async ({ page }) => {
        await page.goto("/p/multi-selection");
        await waitForMendixApp(page);

        await page.locator(".mx-name-dgMultiSelectionCheckbox").waitFor();
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag21aa"])
            .include(".mx-name-dgMultiSelectionCheckbox")
            .exclude(".mx-name-navigationTree3")
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
