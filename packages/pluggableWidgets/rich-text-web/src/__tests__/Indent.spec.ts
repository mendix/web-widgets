import { Editor } from "@tiptap/core";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { StarterKit } from "@tiptap/starter-kit";
import { Indent } from "../extensions/Indent";
import { OrderedListStyled } from "../extensions/OrderedListStyled";

type StyleFormat = "inline" | "class";

const ATTRIBUTE_TYPES = ["paragraph", "heading", "blockquote", "bulletList", "orderedList", "taskList"];

function makeEditor(styleDataFormat: StyleFormat = "inline"): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
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
            })
        ]
    });
}

/** Places the cursor inside the node containing the given text. */
function placeCursorInText(editor: Editor, text: string): void {
    let pos = 1;
    let found = false;
    editor.state.doc.descendants((node, nodePos) => {
        if (found) {
            return false;
        }
        if (node.isText && node.text === text) {
            pos = nodePos + 1;
            found = true;
            return false;
        }
        return true;
    });
    editor.commands.setTextSelection(pos);
}

describe("Indent — listIndent adds margin to the list node", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("adds margin to a top-level ordered list", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>item</p></li></ol>");
        placeCursorInText(editor, "item");

        editor.commands.listIndent();

        const html = editor.getHTML();
        expect(html).toContain("margin-left: 2em");
        expect((html.match(/<ol/g) || []).length).toBe(1); // no nesting
    });

    it("adds margin to a bullet list", () => {
        editor = makeEditor();
        editor.commands.setContent("<ul><li><p>item</p></li></ul>");
        placeCursorInText(editor, "item");

        editor.commands.listIndent();

        expect(editor.getHTML()).toContain("margin-left: 2em");
    });

    it("adds margin to a task list container, not the paragraph", () => {
        editor = makeEditor();
        editor.commands.setContent('<ul data-type="taskList"><li data-checked="false"><p>task</p></li></ul>');
        placeCursorInText(editor, "task");

        editor.commands.listIndent();

        const html = editor.getHTML();
        expect(html).toContain("margin-left: 2em");
        expect((html.match(/margin-left/g) || []).length).toBe(1);
    });

    it("does not give the inner paragraph its own margin (no double indent)", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>item</p></li></ol>");
        placeCursorInText(editor, "item");

        editor.commands.listIndent();

        expect((editor.getHTML().match(/margin-left/g) || []).length).toBe(1);
    });

    it("margins the innermost (nearest) list of a nested structure", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>parent</p><ol><li><p>child</p></li></ol></li></ol>");
        placeCursorInText(editor, "child");

        editor.commands.listIndent();

        // Exactly one list carries a margin, and structure is unchanged (still 2 <ol>).
        const html = editor.getHTML();
        expect((html.match(/margin-left/g) || []).length).toBe(1);
        expect((html.match(/<ol/g) || []).length).toBe(2);
    });

    it("accumulates on repeated calls", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>item</p></li></ol>");
        placeCursorInText(editor, "item");

        editor.commands.listIndent();
        editor.commands.listIndent();
        editor.commands.listIndent();

        expect(editor.getHTML()).toContain("margin-left: 6em");
    });

    it("caps at maxIndent", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>item</p></li></ol>");
        placeCursorInText(editor, "item");

        for (let i = 0; i < 15; i++) {
            editor.commands.listIndent();
        }

        expect(editor.getHTML()).toContain("margin-left: 20em");
        expect(editor.getHTML()).not.toContain("margin-left: 22em");
    });
});

describe("Indent — listOutdent removes margin, clamps at zero", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("decreases margin", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>item</p></li></ol>");
        placeCursorInText(editor, "item");

        editor.commands.listIndent();
        editor.commands.listIndent();
        editor.commands.listOutdent();

        expect(editor.getHTML()).toContain("margin-left: 2em");
    });

    it("is a no-op at zero margin (does not unlist, no negative)", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>item</p></li></ol>");
        placeCursorInText(editor, "item");

        const changed = editor.commands.listOutdent();

        expect(changed).toBe(false);
        const html = editor.getHTML();
        expect(html).toContain("<ol");
        expect(html).not.toContain("margin-left");
    });
});

describe("Indent — keyboard shortcut routing (Mod-] / Mod-[)", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    function pressCtrl(editor: Editor, key: string): void {
        editor.view.dom.dispatchEvent(new KeyboardEvent("keydown", { key, ctrlKey: true, bubbles: true }));
    }

    it("Ctrl+] in a list margins the list node (real keydown)", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>item</p></li></ol>");
        placeCursorInText(editor, "item");

        pressCtrl(editor, "]");

        expect(editor.getHTML()).toContain('<ol style="margin-left: 2em;">');
    });

    it("Ctrl+[ in a list at zero margin does not unlist (real keydown)", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>item</p></li></ol>");
        placeCursorInText(editor, "item");

        pressCtrl(editor, "[");

        const html = editor.getHTML();
        expect(html).toContain("<ol");
        expect(html).not.toContain("margin-left");
    });

    it("Mod-] in a paragraph indents the paragraph (via increaseIndent)", () => {
        editor = makeEditor();
        editor.commands.setContent("<p>text</p>");
        editor.commands.setTextSelection(1);

        editor.commands.increaseIndent();

        expect(editor.getHTML()).toContain("margin-left: 2em");
    });

    it("Mod-[ in a paragraph at zero is a no-op", () => {
        editor = makeEditor();
        editor.commands.setContent("<p>text</p>");
        editor.commands.setTextSelection(1);

        const changed = editor.commands.decreaseIndent();

        expect(changed).toBe(false);
        expect(editor.getHTML()).not.toContain("margin-left");
    });
});

describe("Indent — Tab nesting is unaffected", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("increaseIndent (paragraph walk) does not margin the list node", () => {
        // The toolbar buttons + paragraph Tab call increaseIndent. With lists excluded
        // from `types`, the walk must not put a margin on the <ol>/<ul> node itself.
        // (It may still indent the paragraph inside the list item — pre-existing behavior.)
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>item</p></li></ol>");
        placeCursorInText(editor, "item");

        editor.commands.increaseIndent();

        const html = editor.getHTML();
        // The <ol> tag carries no inline margin style.
        expect(html).toMatch(/<ol>/); // bare <ol>, no style attribute
        expect(html).not.toMatch(/<ol[^>]*margin-left/);
    });

    it("sinkListItem still nests a list item structurally", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>first</p></li><li><p>second</p></li></ol>");
        placeCursorInText(editor, "second");

        const before = (editor.getHTML().match(/<ol/g) || []).length;
        editor.commands.sinkListItem("listItem");
        const after = (editor.getHTML().match(/<ol/g) || []).length;

        expect(after).toBeGreaterThan(before);
        expect(editor.getHTML()).not.toContain("margin-left");
    });
});

describe("Indent — margin coexists with list style type", () => {
    it("renders both list-style-type and margin-left in inline mode", () => {
        const editor = makeEditor("inline");
        editor.commands.setContent('<ol style="list-style-type: lower-alpha;"><li><p>item</p></li></ol>');
        placeCursorInText(editor, "item");

        editor.commands.listIndent();

        const html = editor.getHTML();
        expect(html).toContain("list-style-type: lower-alpha");
        expect(html).toContain("margin-left: 2em");
        editor.destroy();
    });

    it("renders both list-style class and indent class in class mode", () => {
        const editor = makeEditor("class");
        editor.commands.setContent('<ol data-list-style="lower-alpha"><li><p>item</p></li></ol>');
        placeCursorInText(editor, "item");

        editor.commands.listIndent();

        const html = editor.getHTML();
        expect(html).toContain("list-style-lower-alpha");
        expect(html).toContain("indent-1");
        editor.destroy();
    });
});

describe("Indent — paragraph indent still works", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("indents a paragraph via the walk", () => {
        editor = makeEditor();
        editor.commands.setContent("<p>text</p>");
        editor.commands.setTextSelection(1);

        editor.commands.increaseIndent();

        expect(editor.getHTML()).toContain("margin-left: 2em");
    });
});

/** Reads the `indent` attribute stored on the first block of the document. */
function firstBlockIndent(editor: Editor): unknown {
    return editor.state.doc.firstChild?.attrs.indent;
}

describe("Indent — margin-left parses from any CSS length unit", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    // One indent level renders as `2em` = 32px at the 16px default root.
    it.each([
        ["26.1pt", 1], // Microsoft Word — the reported bug: used to yield 13, clamped to 10
        ["36pt", 1], // Word's 0.5in indent step
        ["64px", 2],
        ["1in", 3], // 96px
        ["2cm", 2], // ~75.6px
        ["10mm", 1], // ~37.8px
        ["2pc", 1], // 32px exactly
        ["2em", 1], // the widget's own output — round-trip
        ["4rem", 2],
        ["20em", 10], // the widget's maximum
        ["25%", 0], // resolves against container width, unknowable at parse time
        ["20px", 0], // below one full level — never rounds up
        ["0", 0],
        ["auto", 0], // not a length
        ["calc(2em + 4px)", 0] // not statically resolvable
    ])("parses margin-left: %s as indent level %i", (margin, expected) => {
        editor = makeEditor();
        editor.commands.setContent(`<p style="margin-left: ${margin}">text</p>`);

        expect(firstBlockIndent(editor)).toBe(expected);
    });

    it("renders 26.1pt from Word as 2em, not 20em", () => {
        editor = makeEditor();
        editor.commands.setContent('<h1 style="margin-left: 26.1pt">SCOPE OF ESTIMATE</h1>');

        const html = editor.getHTML();
        expect(html).toContain("margin-left: 2em");
        expect(html).not.toContain("margin-left: 20em");
    });

    it("round-trips its own output byte-identically", () => {
        editor = makeEditor();
        editor.commands.setContent('<p style="margin-left: 6em">text</p>');

        expect(editor.getHTML()).toContain("margin-left: 6em");
    });

    it("treats a missing margin-left as no indent", () => {
        editor = makeEditor();
        editor.commands.setContent("<p>text</p>");

        expect(firstBlockIndent(editor)).toBe(0);
        expect(editor.getHTML()).not.toContain("margin-left");
    });
});

describe("Indent — negative margins do not indent", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("parses a negative margin as 0, not as its magnitude", () => {
        editor = makeEditor();
        editor.commands.setContent('<p style="margin-left: -18pt">text</p>');

        expect(firstBlockIndent(editor)).toBe(0);
        expect(editor.getHTML()).not.toContain("margin-left");
    });

    it("ignores text-indent on a Word hanging indent", () => {
        editor = makeEditor();
        editor.commands.setContent('<p style="margin-left: 36pt; text-indent: -18pt">text</p>');

        // Level comes from margin-left only; the negative text-indent contributes nothing.
        expect(firstBlockIndent(editor)).toBe(1);
    });
});

describe("Indent — the parsed level is clamped before it reaches the node", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("clamps an above-maximum margin at parse time, not only at render", () => {
        editor = makeEditor();
        editor.commands.setContent('<p style="margin-left: 100em">text</p>');

        // The stored attribute itself must be in range — the old code stored 50
        // and relied on renderHTML to clamp.
        expect(firstBlockIndent(editor)).toBe(10);
        expect(editor.getHTML()).toContain("margin-left: 20em");
    });

    it("clamps an above-maximum data-indent", () => {
        editor = makeEditor();
        editor.commands.setContent('<p data-indent="99">text</p>');

        expect(firstBlockIndent(editor)).toBe(10);
    });
});

describe("Indent — data-indent is the canonical machine-set channel", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("honours data-indent in inline mode", () => {
        editor = makeEditor("inline");
        editor.commands.setContent('<p data-indent="2">text</p>');

        expect(firstBlockIndent(editor)).toBe(2);
        expect(editor.getHTML()).toContain("margin-left: 4em");
    });

    it("prefers data-indent over a conflicting margin-left", () => {
        editor = makeEditor("inline");
        editor.commands.setContent('<p data-indent="1" style="margin-left: 20em">text</p>');

        expect(firstBlockIndent(editor)).toBe(1);
        expect(editor.getHTML()).toContain("margin-left: 2em");
    });

    it("honours data-indent in class mode (unchanged behavior)", () => {
        editor = makeEditor("class");
        editor.commands.setContent('<p data-indent="3">text</p>');

        expect(firstBlockIndent(editor)).toBe(3);
        const html = editor.getHTML();
        expect(html).toContain('data-indent="3"');
        expect(html).toContain("indent-3");
    });

    it("still ignores margin-left in class mode", () => {
        editor = makeEditor("class");
        editor.commands.setContent('<p style="margin-left: 26.1pt">text</p>');

        expect(firstBlockIndent(editor)).toBe(0);
    });

    it("ignores a non-numeric data-indent", () => {
        editor = makeEditor("inline");
        editor.commands.setContent('<p data-indent="lots">text</p>');

        expect(firstBlockIndent(editor)).toBe(0);
    });
});

describe("Indent — unit-aware parsing applies to every content source", () => {
    it("applies to the initial content value", () => {
        const element = document.createElement("div");
        document.body.appendChild(element);
        const editor = new Editor({
            element,
            content: '<p style="margin-left: 36pt">stored value</p>',
            extensions: [
                StarterKit.configure({ orderedList: false }),
                OrderedListStyled.configure({ styleDataFormat: "inline" }),
                TaskList,
                TaskItem.configure({ nested: true }),
                Indent.configure({
                    types: ["paragraph", "heading", "blockquote"],
                    attributeTypes: ATTRIBUTE_TYPES,
                    minIndent: 0,
                    maxIndent: 10,
                    indentStep: 1,
                    styleDataFormat: "inline"
                })
            ]
        });

        expect(firstBlockIndent(editor)).toBe(1);
        editor.destroy();
    });

    it("applies to a later setContent (external value update)", () => {
        const editor = makeEditor();
        editor.commands.setContent("<p>initial</p>");
        editor.commands.setContent('<p style="margin-left: 72pt">updated</p>');

        // 72pt = 96px = 3 levels. Layer 2 has no fragment context, so it cannot
        // infer that Word would call this level 2 — that is the sanitizer's job.
        expect(firstBlockIndent(editor)).toBe(3);
        editor.destroy();
    });
});
