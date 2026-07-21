import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
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
