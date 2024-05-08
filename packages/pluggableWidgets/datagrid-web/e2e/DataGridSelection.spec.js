import { test, expect } from "@playwright/test";

test("datagrid-web selection", async ({ page }) => {

    test("applies checkbox single selection checkbox", async () => {
        await page.goto("/p/single-selection");
        const singleSelectionCheckbox = page.locator(".mx-name-dgSingleSelectionCheckbox");
        await expect(singleSelectionCheckbox).toBeVisible();
        await singleSelectionCheckbox.locator("input").first().click();
        await expect(page).toHaveScreenshot(`datagridSingleSelectionCheckbox.png`);
    });

    test("applies checkbox single selection row click", async () => {
        const singleSelectionRowClick = page.locator(".mx-name-dgSingleSelectionRowClick");
        await expect(singleSelectionRowClick).toBeVisible();
        await singleSelectionRowClick
            .locator(".td")
            .first()
            .click({ modifiers: ["Shift"] });
        await expect(page).toHaveScreenshot(`datagridSingleSelectionRowClick.png`);
    });

    test("applies checkbox multi selection checkbox", async () => {
        await page.goto("/p/multi-selection");
        const multiSelectionCheckbox = page.locator(".mx-name-dgMultiSelectionCheckbox");
        await expect(multiSelectionCheckbox).toBeVisible();
        await multiSelectionCheckbox.locator("input").first().click();
        await multiSelectionCheckbox.locator("input").nth(1).click();
        await expect(page).toHaveScreenshot(`datagridMultiSelectionCheckbox.png`);
    });

    test("applies checkbox multi selection row click", async () => {
        const multiSelectionRowClick = page.locator(".mx-name-dgMultiSelectionRowClick");
        await expect(multiSelectionRowClick).toBeVisible();
        await multiSelectionRowClick.locator(".td").first().click({ force: true });
        await multiSelectionRowClick
            .locator(".td")
            .nth(4)
            .click({ modifiers: ["Shift"] });
        await expect(page).toHaveScreenshot(`datagridMultiSelectionRowClick.png`);
    });

    test("checks accessibility violations", async () => {
        await page.goto("/p/multi-selection");
        await page.initializeAccessibility();
        await page.setAccessibilityOptions({
            rules: [
                { id: "aria-required-children", reviewOnFail: true },
                { id: "label", reviewOnFail: true }
            ]
        });

        const multiSelectionCheckbox = page.locator(".mx-name-dgMultiSelectionCheckbox");
        const report = await multiSelectionCheckbox.accessibilitySnapshot({
            runOnly: {
                type: "tag",
                values: ["wcag2a"]
            }
        });

        for (const violation of report.violations) {
            console.log(`Violation: ${violation.description}`);
        }
    });
});
