import { test, expect } from "@mendix/run-e2e/fixtures";

test.describe("html-element-web", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.describe("element", () => {
        test("renders the tag with its child widgets", async ({ page }) => {
            const element = page.locator(".mx-name-htmlElementContainer");

            await expect(element).toBeVisible();
            await expect(element).toHaveJSProperty("tagName", "DIV");
            await expect(element.locator(".mx-name-textChild")).toHaveText("Child widget");
        });

        test("renders the HTML content", async ({ page }) => {
            const element = page.locator(".mx-name-htmlElementHeading");

            await expect(element).toHaveJSProperty("tagName", "H2");
            await expect(element.locator("em")).toHaveText("emphasis");
        });

        test("renders a custom tag", async ({ page }) => {
            const element = page.locator(".mx-name-htmlElementCustomTag");

            await expect(element).toHaveJSProperty("tagName", "SECTION");
            await expect(element).toHaveText("Section content");
        });
    });

    test.describe("attributes", () => {
        test("sets attributes from expressions and text templates", async ({ page }) => {
            const element = page.locator(".mx-name-htmlElementContainer");

            await expect(element).toHaveAttribute("title", "Static title");
            await expect(element).toHaveAttribute("aria-label", "Clicked 0 times");
        });

        test("adds the class attribute to the widget classes", async ({ page }) => {
            const element = page.locator(".mx-name-htmlElementContainer");

            await expect(element).toHaveClass(/\bwidget-html-element\b/);
            await expect(element).toHaveClass(/\bcustom-class\b/);
        });

        test("applies the style attribute", async ({ page }) => {
            const element = page.locator(".mx-name-htmlElementContainer");

            await expect(element).toHaveCSS("color", "rgb(255, 0, 0)");
            await expect(element).toHaveCSS("padding-top", "4px");
        });

        test("updates a template attribute when its value changes", async ({ page }) => {
            const element = page.locator(".mx-name-htmlElementContainer");

            await page.locator(".mx-name-htmlElementClick").click();

            await expect(element).toHaveAttribute("aria-label", "Clicked 1 times");
        });
    });

    test.describe("sanitization", () => {
        test("removes scripts and event handlers from the HTML content", async ({ page }) => {
            const element = page.locator(".mx-name-htmlElementSanitized");

            await expect(element.locator("b")).toHaveText("bold");
            await expect(element.locator("img")).toHaveCount(1);
            await expect(element.locator("img")).not.toHaveAttribute("onerror");
            await expect(element.locator("script")).toHaveCount(0);
            expect(await page.evaluate("window.htmlElementXss")).toBeUndefined();
        });

        test("applies the sanitization configuration", async ({ page }) => {
            const element = page.locator(".mx-name-htmlElementSanitizationConfig");

            await expect(element.locator("i")).toHaveText("italic");
            await expect(element.locator("b")).toHaveCount(0);
            await expect(element).toHaveText("bold italic");
        });
    });

    test.describe("repeat", () => {
        test("renders an element per item of the data source", async ({ page }) => {
            const items = page.locator(".mx-name-htmlElementList > .mx-name-htmlElementListItem");

            await expect(items).toHaveText(["Alpha", "Beta", "Gamma"]);
            await expect(items.nth(0)).toHaveJSProperty("tagName", "LI");
            await expect(items.nth(0)).toHaveAttribute("data-position", "1");
            await expect(items.nth(2)).toHaveAttribute("data-position", "3");
        });

        test("runs the event action with the item of the clicked element", async ({ page }) => {
            const buttons = page.locator(".mx-name-htmlElementItemButton");
            await expect(buttons).toHaveCount(3);

            await buttons.filter({ hasText: "Beta" }).click();

            await expect(page.locator(".mx-name-textSelectedItem")).toHaveText("Selected Beta");
        });
    });

    test.describe("events", () => {
        const clicks = page => page.locator(".mx-name-textClicks");

        test("runs the event action", async ({ page }) => {
            await expect(clicks(page)).toHaveText("Clicks: 0, inner: 0, outer: 0");

            await page.locator(".mx-name-htmlElementClick").click();

            await expect(clicks(page)).toHaveText("Clicks: 1, inner: 0, outer: 0");
        });

        test("stops the event from reaching the parent element", async ({ page }) => {
            await page.locator(".mx-name-htmlElementInnerStop").click();

            await expect(clicks(page)).toHaveText("Clicks: 0, inner: 1, outer: 0");
        });

        test("lets the event reach the parent element when propagation is not stopped", async ({ page }) => {
            await page.locator(".mx-name-htmlElementInnerBubble").click();

            await expect(clicks(page)).toHaveText("Clicks: 0, inner: 1, outer: 1");
        });

        test("prevents the default browser action", async ({ page }) => {
            await page.locator(".mx-name-htmlElementLinkPrevented").click();

            await expect(clicks(page)).toHaveText("Clicks: 1, inner: 0, outer: 0");
            await expect(page).not.toHaveURL(/#/);
        });

        test("keeps the default browser action when it is not prevented", async ({ page }) => {
            await page.locator(".mx-name-htmlElementLinkFollowed").click();

            await expect(clicks(page)).toHaveText("Clicks: 1, inner: 0, outer: 0");
            await expect(page).toHaveURL(/#followed$/);
        });
    });
});
