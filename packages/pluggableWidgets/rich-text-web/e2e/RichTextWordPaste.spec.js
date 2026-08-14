import { expect, test } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

/**
 * Word clipboard HTML. The heading is the shape Word actually puts on the
 * clipboard for a numbered heading: the number lives in an `mso-list:Ignore`
 * span padded by a 7pt run of non-breaking spaces, wrapped in a downlevel-revealed
 * conditional comment, and the indent is a `26.1pt` margin that carries an
 * `mso-list` level alongside it. The bullet paragraph uses Word's symbol-font
 * hack, where a middle dot in Symbol stands in for a real bullet character.
 */
const WORD_CLIPBOARD_HTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta name=Generator content="Microsoft Word 15"></head>
<body>
<div class=WordSection1>
<h1 style='margin-top:6.0pt;margin-right:0in;margin-bottom:6.0pt;margin-left:
26.1pt;mso-list:l0 level1 lfo1;tab-stops:list 26.1pt left .5in'><![if !supportLists]><span
style='mso-fareast-font-family:Arial;mso-bidi-font-family:Arial'><span
style='mso-list:Ignore'>2.<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span></span><![endif]><span style='mso-bidi-font-family:Arial'>SCOPE
OF ESTIMATE<o:p></o:p></span></h1>
<p class=MsoListParagraph style='margin-left:72.0pt;text-indent:-18.0pt;mso-list:l1 level2 lfo2'><![if !supportLists]><span
style='font-family:Symbol'><span style='mso-list:Ignore'>·<span
style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><span
style='mso-bidi-font-family:Arial'>Bulleted detail<o:p></o:p></span></p>
</div>
</body>
</html>`;

/** Pastes `text/html` into a contenteditable the way a real clipboard paste arrives. */
async function pasteHtml(editor, html) {
    await editor.click();
    await editor.evaluate((element, clipboardHtml) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.setData("text/html", clipboardHtml);
        dataTransfer.setData("text/plain", element.textContent ?? "");
        element.dispatchEvent(
            new ClipboardEvent("paste", { clipboardData: dataTransfer, bubbles: true, cancelable: true })
        );
    }, html);
}

/** Empties the editor so assertions only see the pasted content. */
async function clearEditor(page, editor) {
    await editor.click();
    await editor.selectText();
    await page.keyboard.press("Backspace");
}

test.describe("RichText — pasting from Microsoft Word", () => {
    test.describe.configure({ mode: "serial" });

    test("indents pasted Word content by its real level and keeps the list marker readable", async ({ page }) => {
        await page.goto("/p/advanced");
        await waitForMendixApp(page);

        const widget = page.locator(".mx-name-richText1");
        const editor = widget.locator(".tiptap");
        await editor.scrollIntoViewIfNeeded();
        await expect(editor).toBeVisible();

        await clearEditor(page, editor);
        await pasteHtml(editor, WORD_CLIPBOARD_HTML);

        // The heading survives as a heading and its number survives as text.
        const heading = editor.locator("h1");
        await expect(heading).toHaveCount(1);
        await expect(heading).toContainText("2. SCOPE OF ESTIMATE");

        // Level 1 emits `2em`. The bug under test emitted `20em` — the clamped
        // maximum — for this same 26.1pt source margin. Asserted on the emitted
        // value rather than the computed pixels, because `em` resolves against
        // the heading's own font-size and so is not a fixed pixel count.
        await expect(heading).toHaveAttribute("style", /margin-left:\s*2em/);
        await expect(heading).not.toHaveAttribute("style", /margin-left:\s*20em/);

        // The bullet paragraph is at Word level 2, and its symbol-font middle dot
        // is now a real bullet character rather than a literal `·` in Symbol.
        const bullet = editor.locator("p", { hasText: "Bulleted detail" }).first();
        await expect(bullet).toHaveAttribute("style", /margin-left:\s*4em/);
        await expect(bullet).toContainText("• Bulleted detail");
    });

    test("leaves no Word markup residue in the editor output", async ({ page }) => {
        await page.goto("/p/advanced");
        await waitForMendixApp(page);

        const editor = page.locator(".mx-name-richText1 .tiptap");
        await editor.scrollIntoViewIfNeeded();
        await expect(editor).toBeVisible();

        await clearEditor(page, editor);
        await pasteHtml(editor, WORD_CLIPBOARD_HTML);
        await expect(editor.locator("h1")).toContainText("SCOPE OF ESTIMATE");

        const html = await editor.innerHTML();

        expect(html).not.toMatch(/mso-/i);
        expect(html).not.toMatch(/Mso[A-Z]/);
        expect(html).not.toContain("tab-stops");
        expect(html).not.toContain("supportLists");
        expect(html).not.toContain("o:p");
        // The 7pt tab filler and its run of non-breaking spaces are gone.
        expect(html).not.toContain("7pt");
        // The number is text in the block, not a reconstructed list.
        expect(html).not.toContain("<ol");
    });

    test("keeps Word indentation in class mode, where margins are not emitted", async ({ page }) => {
        await page.goto("/p/classmode");
        await waitForMendixApp(page);

        const editor = page.locator(".mx-name-richText1 .tiptap");
        await editor.scrollIntoViewIfNeeded();
        await expect(editor).toBeVisible();

        await clearEditor(page, editor);
        await pasteHtml(editor, WORD_CLIPBOARD_HTML);

        const heading = editor.locator("h1");
        await expect(heading).toContainText("2. SCOPE OF ESTIMATE");
        await expect(heading).toHaveAttribute("data-indent", "1");
        await expect(heading).toHaveClass(/indent-1/);

        // Class mode expresses indentation through the class, never inline.
        expect(await editor.innerHTML()).not.toMatch(/style="[^"]*margin-left/);
    });

    test("indents a paste from a non-Word source from its margin alone", async ({ page }) => {
        await page.goto("/p/advanced");
        await waitForMendixApp(page);

        const editor = page.locator(".mx-name-richText1 .tiptap");
        await editor.scrollIntoViewIfNeeded();
        await expect(editor).toBeVisible();

        await clearEditor(page, editor);
        await pasteHtml(editor, '<h1 style="margin-left: 64px">Plain heading</h1>');

        // The sanitizer does not run here — there are no Word markers — so the
        // level comes from unit-aware margin parsing alone: 64px is two levels.
        const heading = editor.locator("h1");
        await expect(heading).toContainText("Plain heading");
        await expect(heading).toHaveAttribute("style", /margin-left:\s*4em/);
    });
});
