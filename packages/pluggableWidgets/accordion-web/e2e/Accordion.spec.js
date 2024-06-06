import { test, expect } from "@playwright/test";

test.describe("Accordion", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("compares with a screenshot baseline and checks if all accordion elements are rendered as expected", async ({
        page
    }) => {
        await expect(page.locator(".mx-name-container2")).toHaveScreenshot("accordionPageContent.png");
    });

    test("hides group when the visibility is false", async ({ page }) => {
        const accordionGroup = ".mx-name-accordion1 > section:nth-child(3)";
        const button = ".mx-name-actionButton1";

        await expect(page.locator(accordionGroup)).toContainText("Secondary");
        await page.locator(button).click();
        await expect(page.locator(accordionGroup)).toContainText("Success (custom header)");
    });

    test("shows first group content", async ({ page }) => {
        const accordionGroup = ".mx-name-accordion1 > section";
        const accordionGroupContent = ".mx-name-text5";

        await expect(page.locator(`${accordionGroup} ${accordionGroupContent}`)).not.toBeVisible();
        await page.locator(accordionGroup).first().click();
        await expect(page.locator(`${accordionGroup} ${accordionGroupContent}`)).toBeVisible();
    });

    test("shows one image in the group content", async ({ page }) => {
        const accordionGroup = ".mx-name-accordion1 > section:nth-child(2)";
        const accordionGroupContent = ".mx-name-image1";

        await expect(page.locator(`${accordionGroup} ${accordionGroupContent}`)).not.toBeVisible();
        await page.locator(accordionGroup).click();
        await expect(page.locator(`${accordionGroup} ${accordionGroupContent}`)).toBeVisible();
    });

    test("shows single accordion expanded at a time", async ({ page }) => {
        const firstAccordionGroup = ".mx-name-accordion1 > section";
        const firstAccordionGroupContent = ".mx-name-text5";
        const secondAccordionGroup = ".mx-name-accordion1 > section:nth-child(2)";
        const secondAccordionGroupContent = ".mx-name-image1";
        const thirdAccordionGroup = ".mx-name-accordion1 > section:nth-child(3)";
        const thirdAccordionGroupContent = ".mx-name-image2";

        await expect(page.locator(`${firstAccordionGroup} ${firstAccordionGroupContent}`)).not.toBeVisible();
        await expect(page.locator(`${secondAccordionGroup} ${secondAccordionGroupContent}`)).not.toBeVisible();
        await expect(page.locator(`${thirdAccordionGroup} ${thirdAccordionGroupContent}`)).not.toBeVisible();
        await page.locator(firstAccordionGroup).first().click();
        await expect(page.locator(`${firstAccordionGroup} ${firstAccordionGroupContent}`)).toBeVisible();
        await expect(page.locator(`${secondAccordionGroup} ${secondAccordionGroupContent}`)).not.toBeVisible();
        await expect(page.locator(`${thirdAccordionGroup} ${thirdAccordionGroupContent}`)).not.toBeVisible();
        await page.locator(thirdAccordionGroup).first().click();
        await expect(page.locator(`${firstAccordionGroup} ${firstAccordionGroupContent}`)).not.toBeVisible();
        await expect(page.locator(`${secondAccordionGroup} ${secondAccordionGroupContent}`)).not.toBeVisible();
        await expect(page.locator(`${thirdAccordionGroup} ${thirdAccordionGroupContent}`)).toBeVisible();
    });

    test("shows multiple accordions expanded", async ({ page }) => {
        const accordionGroup = ".mx-name-accordion2 > section";
        const accordionGroupContent = ".mx-name-accordion3";

        await expect(page.locator(`${accordionGroup} ${accordionGroupContent}`)).not.toBeVisible();
        await page.locator(accordionGroup).first().click();
        await expect(page.locator(`${accordionGroup} ${accordionGroupContent}`)).toBeVisible();

        const secondAccordionGroup = ".mx-name-accordion3 > section";
        const secondAccordionGroupContent = ".mx-name-text6";

        await expect(page.locator(`${secondAccordionGroup} ${secondAccordionGroupContent}`)).not.toBeVisible();
        await page.locator(secondAccordionGroup).first().click();
        await expect(page.locator(`${secondAccordionGroup} ${secondAccordionGroupContent}`)).toBeVisible();
    });
});
