import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Fieldset", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/configuration-combinations");
        await page.waitForLoadState("networkidle");
    });

    test("renders content and legend", async ({ page }) => {
        const fieldset = ".mx-name-fieldsetLegendYes > legend";
        const legend = await page.locator(fieldset);
        await expect(legend).toContainText("Smith's personal info");

        const inputs = await page.locator(`fieldset[name=fieldsetLegendYes] > :not(legend)`);
        await expect(inputs.first()).toHaveClass("mx-name-LegendYesFirstNameTextBox mx-textbox form-group");
        await expect(inputs.nth(1)).toHaveClass("mx-name-LegendYesLastNameTextBox mx-textbox form-group");
    });

    test("renders content without legend", async ({ page }) => {
        const inputs = await page.locator(`fieldset[name=fieldsetLegendNo] > :not(legend)`);
        await expect(inputs.first()).toHaveClass("mx-name-LegendNoFirstNameTextBox mx-textbox form-group");
        await expect(inputs.nth(1)).toHaveClass("mx-name-LegendNoLastNameTextBox mx-textbox form-group");
    });

    test("renders when content is hidden by conditional visibility", async ({ page }) => {
        const checkBoxWidget = ".mx-name-checkBoxVisible";
        const fieldset = ".mx-name-fieldsetConVis";
        const legend = await page.locator(fieldset).filter("legend");
        await expect(legend).toBeVisible();

        const inputs = await page.locator(`fieldset[name=fieldsetConVis] > :not(legend)`);
        await expect(inputs).toHaveCount(2);

        await page.locator(checkBoxWidget + " input").click();
        const hiddenInputs = await page.locator(`fieldset[name=fieldsetConVis] > :not(legend)`);
        await expect(hiddenInputs).toHaveCount(0);
    });

    test("updates legend when attribute value changes", async ({ page }) => {
        const fieldset = ".mx-name-fieldsetLegendYes > legend";
        const legend = await page.locator(fieldset);
        await expect(legend).toHaveText("Smith's personal info");

        const lastNameInput = await page.locator(
            `fieldset[name=fieldsetLegendYes] > :not(legend) + :not(legend) input`
        );
        await lastNameInput.click({ clickCount: 3 });
        await lastNameInput.fill("Smiths");
        await lastNameInput.press("Enter");

        await expect(legend).toHaveText("Smiths's personal info");
    });
});
