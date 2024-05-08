import { test, expect } from "@playwright/test";

test.describe("Fieldset", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/configuration-combinations");
    });

    test("renders content and legend", async ({ page }) => {
        const fieldset = ".mx-name-fieldsetLegendYes";
        const legend = await page.$(fieldset).locator("legend");
        await expect(legend).toHaveText("Smith's personal info");

        const inputs = await page.$$(`fieldset[name=fieldsetLegendYes] > :not(legend)`);
        await expect(inputs[0]).toHaveClass("mx-name-LegendYesFirstNameTextBox");
        await expect(inputs[1]).toHaveClass("mx-name-LegendYesLastNameTextBox");
    });

    test("renders content without legend", async ({ page }) => {
        const fieldset = ".mx-name-fieldsetLegendNo";
        const legend = await page.$(fieldset).locator("legend");
        await expect(legend).not.toBeVisible();

        const inputs = await page.$$(`fieldset[name=fieldsetLegendNo] > :not(legend)`);
        await expect(inputs[0]).toHaveClass("mx-name-LegendNoFirstNameTextBox");
        await expect(inputs[1]).toHaveClass("mx-name-LegendNoLastNameTextBox");
    });

    test("renders when content is hidden by conditional visibility", async ({ page }) => {
        const checkBoxWidget = ".mx-name-checkBoxVisible";
        const fieldset = ".mx-name-fieldsetConVis";
        const legend = await page.$(fieldset).locator("legend");
        await expect(legend).toBeVisible();

        const inputs = await page.$$(`fieldset[name=fieldsetConVis] > :not(legend)`);
        await expect(inputs).toHaveLength(2);

        await page.click(checkBoxWidget + " input");
        const hiddenInputs = await page.$$(`fieldset[name=fieldsetConVis] > :not(legend)`);
        await expect(hiddenInputs).toHaveLength(0);
    });

    test("updates legend when attribute value changes", async ({ page }) => {
        const fieldset = ".mx-name-fieldsetLegendYes";
        const legend = await page.$(fieldset).locator("legend");
        await expect(legend).toHaveText("Smith's personal info");

        const lastNameInput = await page.$(`fieldset[name=fieldsetLegendYes] > :not(legend) + :not(legend) input`);
        await lastNameInput.click({ clickCount: 3 });
        await lastNameInput.type("Smiths");
        await lastNameInput.press("Enter");

        await expect(legend).toHaveText("Smiths's personal info");
    });
});
