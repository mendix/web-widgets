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

        await page.click('.mx-name-richText1 .tiptap-toolbar button[title="Insert Image"]');
        // Dialogs render in a portal on <body>, so they are not descendants of the widget.
        await expect(page.locator(".toolbar-dialog.image-dialog").first()).toHaveScreenshot(`insertImageDialog.png`);
    });

    test("compares with a screenshot baseline and checks if toolbar advanced mode are rendered as expected", async ({
        page
    }) => {
        await page.goto("/p/advanced");
        await waitForMendixApp(page);
        await page.locator(".mx-name-richText4").scrollIntoViewIfNeeded();
        await expect(page.locator(".mx-name-richText4")).toBeVisible();
        await expect(page.locator(".mx-name-richText4")).toHaveScreenshot(`toolbarAdvancedMode.png`);

        await page.click('.mx-name-richText4 .tiptap-toolbar button[title="View/Edit Code"]');
        await expect(page.locator(".mx-name-richText4 .highlighted-code-editor").first()).toHaveScreenshot(
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
        await waitForMendixApp(page);
        await expect(page.locator(".mx-name-richText1")).toBeVisible();
        await expect(page.locator(".mx-name-richText1")).toHaveScreenshot(`classModeEditor.png`, { threshold: 0.4 });
    });

    // class mode is under development
    // test("checks that class mode editor output uses CSS classes instead of inline styles", async ({ page }) => {
    //     await page.goto("/p/classmode");
    //     await waitForMendixApp(page);

    //     const editor = page.locator(".mx-name-richText1 .tiptap");
    //     await expect(editor).toBeVisible();

    //     // Apply text color, highlight and indent to the first block so the
    //     // class-based output can be asserted. Re-select before each command
    //     // because clicking a toolbar control collapses the DOM selection.
    //     const firstBlock = editor.locator("h1, h2, h3, p").first();

    //     await firstBlock.click({ clickCount: 3 });
    //     await page.click('.mx-name-richText1 button[title="Text Color"]');
    //     await page.locator(".color-picker-dropdown div[title]").nth(10).click();

    //     await firstBlock.click({ clickCount: 3 });
    //     await page.click('.mx-name-richText1 button[title="Background Color"]');
    //     await page.locator(".color-picker-dropdown div[title]").nth(10).click();

    //     await firstBlock.click({ clickCount: 3 });
    //     await page.click('.mx-name-richText1 button[title="Increase Indent"]');

    //     const html = await editor.innerHTML();

    //     // Class mode emits class + data-* attributes, not inline styles.
    //     expect(html).toMatch(/class="[^"]*has-text-color/);
    //     expect(html).toMatch(/data-text-color="/);
    //     expect(html).toMatch(/class="[^"]*has-text-highlight/);
    //     expect(html).toMatch(/data-text-highlight="/);
    //     expect(html).toMatch(/class="[^"]*indent-\d/);
    //     expect(html).toMatch(/data-indent="/);
    //     expect(html).not.toMatch(/style="[^"]*color:/);
    //     expect(html).not.toMatch(/style="[^"]*background-color:/);
    //     expect(html).not.toMatch(/style="[^"]*padding-left:/);
    // });

    test("compares with a screenshot baseline of the View/Edit Code dialog in class mode", async ({ page }) => {
        await page.goto("/p/classmode");
        await waitForMendixApp(page);
        await page.click('.mx-name-richText1 .tiptap-toolbar button[title="View/Edit Code"]');
        await expect(page.locator(".mx-name-richText1 .highlighted-code-editor").first()).toHaveScreenshot(
            `classModeViewCodeDialog.png`
        );
    });

    test("compares with a screenshot for rich text inside modal popup layout", async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);

        await page.click(".mx-navbar-item [title='Demo']");

        await page.click('.mx-name-customWidget1 .tiptap-toolbar button[title="Insert YouTube Video"]');
        await expect(page.locator(".toolbar-dialog.video-dialog").first()).toHaveScreenshot(
            `richTextDialogInsidePopup.png`
        );

        await page.locator(".toolbar-dialog.video-dialog #video-url").fill("https://www.mendix.com");
        await expect(page.locator(".toolbar-dialog.video-dialog").first()).toHaveScreenshot(
            `richTextDialogInsidePopupEdit.png`
        );
    });

    test("clearing all content leaves the editor empty, not a stray <p></p>", async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
        await page.click("text=Generate Data");
        await page.goto("/p/basic");
        await waitForMendixApp(page);

        // Find the first editable rich text editor
        const editor = page.locator(".mx-name-richText1 .tiptap");
        await editor.scrollIntoViewIfNeeded();
        await expect(editor).toBeVisible();

        // Click into the editor and clear all content. selectText() reliably
        // selects the editor contents across platforms, unlike Control+A which
        // depends on OS focus behaviour.
        await editor.click();
        await editor.selectText();
        await page.keyboard.press("Backspace");

        // Blur the editor to trigger the save/normalize path.
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);

        // The editor should now be empty. Tiptap keeps a placeholder paragraph
        // in the DOM, but the widget normalizes that empty paragraph to an
        // empty string on save (see normalizeEmpty in EditorWrapper).
        expect((await editor.textContent())?.trim() || "").toBe("");
        // No text nodes remain — only an empty placeholder paragraph/break.
        const strippedText = (await editor.innerHTML()).replace(/<[^>]*>/g, "").trim();
        expect(strippedText).toBe("");
    });

    test("Tab nests a list inside a table cell instead of jumping cells", async ({ page }) => {
        await page.goto("/p/advanced");
        await waitForMendixApp(page);

        const widget = page.locator(".mx-name-richText1");
        const editor = widget.locator(".tiptap");
        await editor.scrollIntoViewIfNeeded();
        await expect(editor).toBeVisible();

        // Clear any generated content so the assertions target only what we type.
        await editor.click();
        await editor.selectText();
        await page.keyboard.press("Backspace");

        // Insert a 2×2 table via the toolbar grid selector. Cells are laid out
        // row-major (10×10), so row 2 / col 2 is index (2-1)*10 + (2-1) = 11.
        await widget.locator('.tiptap-toolbar button[title="Insert Table"]').click();
        await expect(page.locator(".table-grid-selector")).toBeVisible();
        const tableCell = page.locator(".table-grid-selector .table-grid-cell").nth(11);
        await tableCell.hover();
        await tableCell.click();
        await expect(editor.locator("table")).toBeVisible();

        // Put the cursor in the first body cell and build a two-item bullet list.
        await editor.locator("table td").first().click();
        await widget.locator('.tiptap-toolbar button[title="Bullet List"]').click();
        await page.keyboard.type("first");
        await page.keyboard.press("Enter");
        await page.keyboard.type("second");

        // Tab on the second item must nest it (create a sublist) rather than move
        // the caret to the next table cell.
        await page.keyboard.press("Tab");

        // A nested list exists inside the table cell: a <ul> descendant of an <li>.
        await expect(editor.locator("table li ul")).toHaveCount(1);
    });

    test("inserting a YouTube URL renders a framable embed URL", async ({ page }) => {
        await page.goto("/p/advanced");
        await waitForMendixApp(page);

        const widget = page.locator(".mx-name-richText1");
        const editor = widget.locator(".tiptap");
        await editor.scrollIntoViewIfNeeded();
        await expect(editor).toBeVisible();

        await editor.click();
        await editor.selectText();
        await page.keyboard.press("Backspace");

        await widget.locator('.tiptap-toolbar button[title="Insert YouTube Video"]').click();
        // Portalled to <body>, so scope the dialog to the page rather than the widget.
        const dialog = page.locator(".toolbar-dialog.video-dialog").first();
        await expect(dialog).toBeVisible();

        await dialog.locator("#video-url").fill("https://www.youtube.com/watch?v=3k66DQuU31A");
        await dialog.locator('button[type="submit"]').click();

        // Assert on the iframe attributes only, never on the frame's contents: loading the
        // real player would make this test depend on YouTube being reachable from CI.
        // A /watch URL sets X-Frame-Options: sameorigin, so only /embed/ is playable.
        const iframe = editor.locator(".youtube-container iframe");
        await expect(iframe).toHaveAttribute("src", /^https:\/\/www\.youtube\.com\/embed\/3k66DQuU31A/);
        await expect(iframe).toHaveAttribute("title", /.+/);
        await expect(iframe).toHaveAttribute("allow", /encrypted-media/);
    });

    test("a dialog taller than the viewport scrolls internally and keeps its buttons usable", async ({ page }) => {
        await page.goto("/p/advanced");
        await waitForMendixApp(page);

        // Short viewport so the image dialog cannot fit: the same situation a Media Library tab
        // full of thumbnails creates, without needing that many images.
        await page.setViewportSize({ width: 1024, height: 420 });

        const widget = page.locator(".mx-name-richText1");
        const editor = widget.locator(".tiptap");
        await editor.click();
        await editor.selectText();
        await page.keyboard.press("Backspace");

        await widget.locator('.tiptap-toolbar button[title="Insert Image"]').click();

        // Portalled to <body>, so it is not a descendant of the widget.
        const dialog = page.locator(".toolbar-dialog.image-dialog").first();
        await expect(dialog).toBeVisible();

        // The dialog box stays inside the viewport instead of running off the bottom edge.
        // Geometry is the behaviour under test here, so there is no CSS assertion to use instead.
        const box = await dialog.boundingBox();
        const viewport = page.viewportSize();
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);

        // The overflow moved into the dialog's own scroll region.
        const scrolls = await dialog
            .locator(".dialog-scroll")
            .evaluate(element => element.scrollHeight > element.clientHeight);
        expect(scrolls).toBe(true);

        // The action buttons sit outside that scroll region, so they stay reachable: this is what
        // clipping used to break.
        await dialog.locator("#image-src").fill("https://www.mendix.com/logo.png");
        const insert = dialog.getByRole("button", { name: "Insert", exact: true });
        await expect(insert).toBeVisible();
        await insert.click();

        await expect(editor.locator("img")).toHaveAttribute("src", "https://www.mendix.com/logo.png");
    });

    test("a dialog opened inside a popup page is not clipped by the popup", async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);

        await page.click(".mx-navbar-item [title='Demo']");
        await page.click('.mx-name-customWidget1 .tiptap-toolbar button[title="Insert YouTube Video"]');

        // A popup page centres itself with a transform, which makes it the containing block for any
        // fixed-positioned descendant. The dialog escapes it by rendering in a body-level portal.
        const dialog = page.locator(".toolbar-dialog.video-dialog").first();
        await expect(dialog).toBeVisible();
        await expect(page.locator(".mx-name-customWidget1 .toolbar-dialog.video-dialog")).toHaveCount(0);

        const box = await dialog.boundingBox();
        const viewport = page.viewportSize();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);

        // Still on top of the popup and interactive.
        await dialog.locator("#video-url").fill("https://www.youtube.com/watch?v=3k66DQuU31A");
        await expect(dialog.locator("#video-url")).toHaveValue(/3k66DQuU31A/);
    });
});
