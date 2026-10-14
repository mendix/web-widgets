import { readFileSync } from "fs";
import { join } from "path";
import { Editor } from "@tiptap/core";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { StarterKit } from "@tiptap/starter-kit";
import { Indent } from "../extensions/Indent";
import { OrderedListStyled } from "../extensions/OrderedListStyled";
import { WordPaste } from "../extensions/WordPaste";
import { isWordHtml, sanitizeWordHtml } from "../utils/wordPaste";

type StyleFormat = "inline" | "class";

const ATTRIBUTE_TYPES = ["paragraph", "heading", "blockquote", "bulletList", "orderedList", "taskList"];

function fixture(name: string): string {
    return readFileSync(join(__dirname, "fixtures", name), "utf8");
}

/** Sanitizes, then runs the result through the editor as a paste would. */
function pasteThroughEditor(html: string, styleDataFormat: StyleFormat = "inline"): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const editor = new Editor({
        element,
        extensions: [
            StarterKit.configure({ orderedList: false }),
            OrderedListStyled.configure({ styleDataFormat }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Indent.configure({
                types: ["paragraph", "heading", "blockquote"],
                attributeTypes: ATTRIBUTE_TYPES,
                minIndent: 0,
                maxIndent: 10,
                indentStep: 1,
                styleDataFormat
            }),
            WordPaste
        ]
    });
    editor.commands.setContent(sanitizeWordHtml(html));
    return editor;
}

/**
 * Collapses runs of whitespace. Word hard-wraps its clipboard HTML mid-sentence
 * (`SCOPE\nOF ESTIMATE`), which HTML renders as a single space — so text
 * assertions must compare rendered text, not source bytes. Not for asserting on
 * non-breaking spaces: `\s` matches those too.
 */
function normalizeText(html: string): string {
    return html.replace(/\s+/g, " ");
}

/** `data-indent` values of every block in the sanitized output, in document order. */
function indentLevels(html: string): number[] {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return Array.prototype.slice
        .call(doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, blockquote, li"))
        .map((element: Element) => parseInt(element.getAttribute("data-indent") ?? "0", 10));
}

describe("wordPaste — Word detection", () => {
    it("detects the reported Word fixture", () => {
        expect(isWordHtml(fixture("word-numbered-heading.html"))).toBe(true);
    });

    it("detects Word HTML by an mso declaration alone", () => {
        expect(isWordHtml("<p style='mso-list:l0 level1 lfo1'>x</p>")).toBe(true);
    });

    it("detects Word HTML by an Mso class alone", () => {
        expect(isWordHtml('<p class="MsoNormal">x</p>')).toBe(true);
    });

    it("does not detect ordinary HTML", () => {
        expect(isWordHtml('<p style="margin-left: 36pt">x</p>')).toBe(false);
    });

    it("does not detect Google Docs HTML as Word", () => {
        expect(isWordHtml(fixture("gdocs-indented.html"))).toBe(false);
    });

    it("passes non-Word HTML through byte-identically", () => {
        const html = '<h1 style="margin-left: 36pt">Not from Word</h1><p><span style="color:red">x</span></p>';
        expect(sanitizeWordHtml(html)).toBe(html);
    });
});

describe("wordPaste — the reported numbered heading", () => {
    const output = sanitizeWordHtml(fixture("word-numbered-heading.html"));

    it("keeps the number as text in the heading", () => {
        expect(normalizeText(output)).toContain("2. SCOPE OF ESTIMATE");
    });

    it("preserves the h1 element", () => {
        expect(output).toContain("<h1");
        expect(output).not.toContain("<h2");
    });

    it("creates no list structure", () => {
        expect(output).not.toContain("<ol");
        expect(output).not.toContain("<li");
        expect(output).not.toContain("<ul");
    });

    it("assigns indent level 1 from the mso-list level, not from the 26.1pt margin", () => {
        expect(indentLevels(output)).toEqual([1]);
    });

    it("removes the source margin-left", () => {
        expect(output).not.toContain("margin-left");
    });

    it("removes the tab-filler span and its non-breaking spaces", () => {
        expect(output).not.toContain("7.0pt");
        expect(output).not.toContain("7pt");
        expect(output).not.toMatch(/\u00a0\u00a0/);
    });

    it("removes all mso residue", () => {
        expect(output).not.toMatch(/mso-/i);
        expect(output).not.toContain("tab-stops");
        expect(output).not.toContain("supportLists");
    });

    it("removes office-namespace elements", () => {
        expect(output).not.toContain("o:p");
    });

    it("leaves no empty wrapper spans", () => {
        expect(output).not.toContain("<span>");
    });

    it("renders as an indented h1 through the editor", () => {
        const editor = pasteThroughEditor(fixture("word-numbered-heading.html"));
        const html = editor.getHTML();

        expect(html).toContain("<h1");
        expect(normalizeText(html)).toContain("2. SCOPE OF ESTIMATE");
        expect(html).toContain("margin-left: 2em");
        expect(html).not.toContain("margin-left: 20em");
        editor.destroy();
    });
});

describe("wordPaste — nested ordered list", () => {
    const output = sanitizeWordHtml(fixture("word-nested-ordered-list.html"));

    it("derives uniform levels from the mso-list metadata", () => {
        // level1, level2, level3, level1 — steps of exactly one, despite the
        // source margins being 36pt / 72pt / 108pt (a 48px grid).
        expect(indentLevels(output)).toEqual([1, 2, 3, 1]);
    });

    it("keeps every marker as text", () => {
        expect(output).toContain("1. First item");
        expect(output).toContain("a. Nested item");
        expect(output).toContain("i. Deeply nested item");
        expect(output).toContain("2. Second item");
    });

    it("creates no list structure", () => {
        expect(output).not.toContain("<ol");
        expect(output).not.toContain("<li");
    });

    it("drops the MsoListParagraph class", () => {
        expect(output).not.toMatch(/Mso/i);
    });
});

describe("wordPaste — symbol-font bullets become real characters", () => {
    const output = sanitizeWordHtml(fixture("word-symbol-bullets.html"));

    it("maps the Symbol middle dot to a bullet", () => {
        expect(output).toContain("• Filled bullet item");
    });

    it("maps the Courier New letter o to a white bullet", () => {
        expect(output).toContain("◦ Hollow bullet item");
        expect(output).not.toContain("o Hollow bullet item");
    });

    it("maps the Wingdings section sign to a small square", () => {
        expect(output).toContain("▪ Square bullet item");
        expect(output).not.toContain("§ Square bullet item");
    });

    it("still assigns uniform levels", () => {
        expect(indentLevels(output)).toEqual([1, 2, 3]);
    });

    it("drops the wrapper carrying the bullet font", () => {
        // Substituting the glyph is only half the job: left inside its Symbol /
        // Wingdings / Courier New wrapper, the replacement renders as the wrong
        // character again.
        expect(output).not.toMatch(/Symbol/i);
        expect(output).not.toMatch(/Wingdings/i);
        expect(output).not.toMatch(/Courier/i);
        expect(output).not.toContain("<span");
    });

    it("drops the hanging text-indent along with the marker it positioned", () => {
        expect(output).not.toContain("text-indent");
    });
});

describe("wordPaste — hanging indent and negative margins", () => {
    const output = sanitizeWordHtml(fixture("word-hanging-indent.html"));

    it("derives the level from margin-left, ignoring text-indent", () => {
        // 36pt = 48px is the only qualifying margin, so it is the fragment's step.
        // The second paragraph's -18pt margin is not indentation at all.
        expect(indentLevels(output)).toEqual([1, 0]);
    });

    it("drops the negative margin rather than treating it as indentation", () => {
        expect(output).not.toContain("-18");
    });

    it("keeps the paragraph text", () => {
        expect(output).toContain("Hanging indent paragraph");
        expect(output).toContain("Negative margin paragraph");
    });
});

describe("wordPaste — indent step inferred from the fragment", () => {
    it("derives uniform levels from a consistent step with no mso-list", () => {
        // Word-detected (mso residue present) but with no list metadata.
        const html = `<p class=MsoNormal style='margin-left:36.0pt;mso-bidi-font-family:Arial'>one</p>
            <p class=MsoNormal style='margin-left:72.0pt;mso-bidi-font-family:Arial'>two</p>
            <p class=MsoNormal style='margin-left:108.0pt;mso-bidi-font-family:Arial'>three</p>`;

        expect(indentLevels(sanitizeWordHtml(html))).toEqual([1, 2, 3]);
    });

    it("clusters Word's jitter into a single level", () => {
        const html = `<p style='margin-left:26.1pt;mso-bidi-font-family:Arial'>one</p>
            <p style='margin-left:26.05pt;mso-bidi-font-family:Arial'>two</p>`;

        expect(indentLevels(sanitizeWordHtml(html))).toEqual([1, 1]);
    });

    it("treats a single indented block as level 1", () => {
        const html = "<p style='margin-left:36.0pt;mso-bidi-font-family:Arial'>only</p>";

        expect(indentLevels(sanitizeWordHtml(html))).toEqual([1]);
    });

    it("does not let a below-threshold margin become the step", () => {
        const html = `<p style='margin-left:2.0pt;mso-bidi-font-family:Arial'>tiny</p>
            <p style='margin-left:36.0pt;mso-bidi-font-family:Arial'>real</p>`;

        expect(indentLevels(sanitizeWordHtml(html))).toEqual([0, 1]);
    });
});

describe("wordPaste — style handling", () => {
    it("keeps non-mso declarations and the span carrying them", () => {
        const output = sanitizeWordHtml("<p><span style='color:red;mso-bidi-font-family:Arial'>x</span></p>");

        expect(output).toContain("color:red");
        expect(output).toContain("<span");
        expect(output).not.toMatch(/mso-/i);
    });

    it("unwraps a span left with no attributes", () => {
        const output = sanitizeWordHtml("<p><span style='mso-bidi-font-family:Arial'>x</span></p>");

        expect(output).toContain("x");
        expect(output).not.toContain("<span");
    });

    it("never emits margin-left, so the style mode does not matter", () => {
        expect(sanitizeWordHtml(fixture("word-nested-ordered-list.html"))).not.toContain("margin-left");
    });

    it("resolves a margin-left declaration split across a line break", () => {
        // Verifies the real clipboard shape: `margin-left:\n26.1pt`.
        const html = "<p style='margin-top:6.0pt;margin-left:\n36.0pt;mso-bidi-font-family:Arial'>x</p>";

        expect(indentLevels(sanitizeWordHtml(html))).toEqual([1]);
    });
});

describe("wordPaste — idempotence", () => {
    it.each(["word-numbered-heading.html", "word-nested-ordered-list.html", "word-symbol-bullets.html"])(
        "%s sanitizes to a fixed point",
        name => {
            const once = sanitizeWordHtml(fixture(name));

            expect(isWordHtml(once)).toBe(false);
            expect(sanitizeWordHtml(once)).toBe(once);
        }
    );
});

describe("wordPaste — indentation survives both style modes", () => {
    it("renders margin-left in inline mode", () => {
        const editor = pasteThroughEditor(fixture("word-numbered-heading.html"), "inline");

        expect(editor.getHTML()).toContain("margin-left: 2em");
        editor.destroy();
    });

    it("renders data-indent and the indent class in class mode", () => {
        const editor = pasteThroughEditor(fixture("word-numbered-heading.html"), "class");
        const html = editor.getHTML();

        expect(html).toContain('data-indent="1"');
        expect(html).toContain("indent-1");
        editor.destroy();
    });
});
