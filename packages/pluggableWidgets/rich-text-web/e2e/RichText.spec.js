import { expect, test } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("RichText", () => {
    test.describe.configure({ mode: "serial" });
    test("compares with a screenshot baseline and checks if inline basic mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/");
        await waitForMendixApp(page);
        await page.click("text=Generate Data");
        await page.goto("/p/basic");
        await waitForMendixApp(page);
        await page.locator(".mx-name-richText1").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`inlineBasicMode.png`);
    });

    test("compares with a screenshot baseline and checks if toolbar basic mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/basic");
        await waitForMendixApp(page);
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`toolbarBasicMode.png`);
    });

    test("compares with a screenshot baseline and checks if bottom toolbar advanced mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/advanced");
        await waitForMendixApp(page);
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`bottomToolbarAdvancedMode.png`);

        await page.click(".mx-name-richText1 .ql-toolbar button.ql-image");
        await expect(page.locator(".widget-rich-text .widget-rich-text-modal-body").first()).toHaveScreenshot(
            `insertImageDialog.png`
        );
    });

    test("compares with a screenshot baseline and checks if toolbar advanced mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/advanced");
        await waitForMendixApp(page);
        await page.locator(".mx-name-richText4").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`toolbarAdvancedMode.png`);

        await page.click(".mx-name-richText1 .ql-toolbar button.ql-view-code");
        await expect(page.locator(".widget-rich-text .widget-rich-text-modal-body").first()).toHaveScreenshot(
            `viewCodeDialog.png`
        );
    });

    test("compares with a screenshot baseline and checks if inline custom mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/custom");
        await waitForMendixApp(page);
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`inlineCustomMode.png`);
    });

    test("compares with a screenshot baseline and checks if toolbar custom mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/custom");
        await waitForMendixApp(page);
        await expect(page.locator(".mx-name-richText2")).toBeVisible();
        await expect(page.locator(".mx-name-richText2")).toHaveScreenshot(`toolbarCustomMode.png`);
    });

    test("compares with a screenshot baseline and checks if inline custom mode with all options enabled are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/custom");
        await waitForMendixApp(page);
        await page.locator(".mx-name-richText3").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText3")).toBeVisible();
        await expect(page.locator(".mx-name-richText3")).toHaveScreenshot(`customModeAllOptions.png`);
    });

    test("compares with a screenshot baseline and checks if toolbar custom mode with none option enabled are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/custom");
        await waitForMendixApp(page);
        await page.locator(".mx-name-richText4").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`customModeNoneOptions.png`);
    });

    test("compares with a screenshot baseline and checks for readonly mode basic styling", async ({ page }) => {
        await page.goto("/p/read-only");
        await waitForMendixApp(page);
        await page.locator(".mx-name-richText3").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText3")).toBeVisible();
        await expect(page.locator(".mx-name-richText3")).toHaveScreenshot(`readOnlyModeBasic.png`);
    });

    test("compares with a screenshot baseline and checks for readonly mode bordered styling", async ({ page }) => {
        await page.goto("/p/read-only");
        await waitForMendixApp(page);
        await page.locator(".mx-name-richText2").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText2")).toBeVisible();
        await expect(page.locator(".mx-name-richText2")).toHaveScreenshot(`readOnlyModeBordered.png`);
    });

    test("compares with a screenshot baseline and checks for readonly mode read panel styling", async ({ page }) => {
        await page.goto("/p/read-only");
        await waitForMendixApp(page);
        await page.locator(".mx-name-richText6").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText6")).toBeVisible();
        await expect(page.locator(".mx-name-richText6")).toHaveScreenshot(`readOnlyModeReadPanel.png`);
    });

    test("compares with a screenshot baseline and checks if class mode editor is rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/classmode");
        await page.waitForLoadState("networkidle");
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`classModeEditor.png`, { threshold: 0.4 });
    });

    test("checks that class mode editor output uses CSS classes instead of inline styles", async ({ page }) => {
        await page.goto("/p/classmode");
        await page.waitForLoadState("networkidle");
        const html = await page.locator(".mx-name-richText1 .ql-editor").innerHTML();
        expect(html).toMatch(/class="ql-color-/);
        expect(html).toMatch(/class="ql-bg-/);
        expect(html).toMatch(/class="ql-indent-/);
        expect(html).toMatch(/data-style-format="class"/);
        expect(html).not.toMatch(/style="color:/);
        expect(html).not.toMatch(/style="background-color:/);
        expect(html).not.toMatch(/style="padding-left:/);
    });

    test("compares with a screenshot baseline of the View/Edit Code dialog in class mode", async ({ page }) => {
        await page.goto("/p/classmode");
        await page.waitForLoadState("networkidle");
        await page.click(".mx-name-richText1 .ql-toolbar button.ql-view-code");
        await expect(page.locator(".widget-rich-text .widget-rich-text-modal-body").first()).toHaveScreenshot(
            `classModeViewCodeDialog.png`
        );
    });

    test("compares with a screenshot for rich text inside modal popup layout", async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);

        await page.click(".mx-navbar-item [title='Demo']");

        await page.click(".mx-name-customWidget1 .ql-toolbar button.ql-video");
        await expect(page.locator(".widget-rich-text .widget-rich-text-modal-body").first()).toHaveScreenshot(
            `richTextDialogInsidePopup.png`
        );

        await page.click(".widget-rich-text .widget-rich-text-modal-body #rich-text-video-src-input");
        await page
            .locator(".widget-rich-text .widget-rich-text-modal-body #rich-text-video-src-input")
            .fill("https://www.mendix.com");
        await expect(page.locator(".widget-rich-text .widget-rich-text-modal-body").first()).toHaveScreenshot(
            `richTextDialogInsidePopupEdit.png`
        );
    });
});
