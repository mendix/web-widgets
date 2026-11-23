import { expect, test } from "@mendix/run-e2e/fixtures";
import Combobox from "./utils/Combobox.pageObject";

function widthOf(locator) {
    return expect.poll(async () => Math.round((await locator.boundingBox())?.width ?? -1));
}

// Not scrollWidth > clientWidth: both are rounded, so a sub-pixel overflow that shows an ellipsis reads as fitting.
function truncation(caption) {
    return expect.poll(() =>
        caption.evaluate(el => {
            const text = el.ownerDocument.createRange();
            text.selectNodeContents(el);
            return text.getBoundingClientRect().width > el.getBoundingClientRect().width;
        })
    );
}

test.describe("combobox-web layout with long selected values", () => {
    test.beforeEach(async ({ page }) => {
        // The page is shared by every test in the worker, and another spec resizes it.
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto("/p/combobox-layout");
        await expect(page.locator(".mx-name-comboLong")).toBeVisible({ timeout: 10000 });
    });

    test.describe("in Auto-fill layout grid columns", () => {
        test("keeps the columns equal and truncates the long single select caption", async ({ page }) => {
            const scope = page.locator(".mx-name-autoFillRow");
            const long = new Combobox(scope.locator(".mx-name-comboLong"));
            const short = scope.locator(".mx-name-comboShort");
            const shortWidth = Math.round((await short.boundingBox()).width);

            await widthOf(long.root).toBeLessThanOrEqual(shortWidth + 1);
            await widthOf(long.root).toBeGreaterThanOrEqual(shortWidth - 1);
            await truncation(long.selectedText).toBe(true);
            await expect(page.locator(".mx-name-autoFillSection")).toHaveScreenshot("comboBoxLayoutAutoFill.png");
        });

        test("keeps the columns equal and truncates the long multi select captions", async ({ page }) => {
            const scope = page.locator(".mx-name-autoFillMultiRow");
            const multi = new Combobox(scope.locator(".mx-name-comboMultiText"));
            const shortWidth = Math.round((await scope.locator(".mx-name-comboMultiShort").boundingBox()).width);

            await widthOf(multi.root).toBeLessThanOrEqual(shortWidth + 1);
            await truncation(multi.selectedText).toBe(true);
            await expect(page.locator(".mx-name-autoFillMultiSection")).toHaveScreenshot(
                "comboBoxLayoutAutoFillMulti.png"
            );
        });

        test("keeps the columns equal and truncates the read-only text caption", async ({ page }) => {
            const scope = page.locator(".mx-name-autoFillReadOnlyRow");
            const readOnly = new Combobox(scope.locator(".mx-name-comboReadOnly"));
            const shortWidth = Math.round((await scope.locator(".mx-name-comboReadOnlyShort").boundingBox()).width);

            await widthOf(readOnly.root).toBeLessThanOrEqual(shortWidth + 1);
            await truncation(readOnly.selectedText).toBe(true);
            await expect(page.locator(".mx-name-autoFillReadOnlySection")).toHaveScreenshot(
                "comboBoxLayoutAutoFillReadOnly.png"
            );
        });

        test("shows the typed filter text across the whole field", async ({ page }) => {
            const long = new Combobox(page.locator(".mx-name-autoFillRow .mx-name-comboLong"));
            const fieldWidth = Math.round(
                (await long.root.locator(".widget-combobox-selected-items").boundingBox()).width
            );

            await long.open();
            await long.input.pressSequentially("caption");

            await expect(long.selectedText).toBeHidden();
            await widthOf(long.input).toBeGreaterThanOrEqual(fieldWidth - 1);
        });

        test("keeps the typed multi select text visible after Escape closes the menu", async ({ page }) => {
            const multi = new Combobox(page.locator(".mx-name-autoFillMultiRow .mx-name-comboMultiText"));

            await multi.open();
            await multi.input.pressSequentially("item");
            await multi.input.press("Escape");

            await expect(multi.menu).toBeHidden();
            await expect(multi.input).toBeFocused();
            await expect(multi.input).toHaveValue("item");
            await widthOf(multi.input).toBeGreaterThan(50);
            await expect(page.locator(".mx-name-autoFillMultiSection")).toHaveScreenshot(
                "comboBoxLayoutAutoFillMultiEscape.png"
            );
        });
    });

    test.describe("in parents that size to their content", () => {
        test("fits the whole caption in an Auto-fit column", async ({ page }) => {
            const autoFit = new Combobox(page.locator(".mx-name-autoFitRow .mx-name-comboAutoFit"));

            await truncation(autoFit.selectedText).toBe(false);
            await expect(page.locator(".mx-name-autoFitSection")).toHaveScreenshot("comboBoxLayoutAutoFit.png");
        });

        // WC-3409
        test("fits the whole caption in a centered flex column", async ({ page }) => {
            const centered = new Combobox(page.locator(".mx-name-flexCenter .mx-name-comboCentered"));

            await truncation(centered.selectedText).toBe(false);
            await expect(page.locator(".mx-name-flexCenterSection")).toHaveScreenshot("comboBoxLayoutFlexCenter.png");
        });
    });
});
