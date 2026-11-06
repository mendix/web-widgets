import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { OrderedListStyled } from "../OrderedListStyled";

type StyleDataFormat = "inline" | "class";

function makeEditor(styleDataFormat: StyleDataFormat = "inline", content = ""): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [StarterKit.configure({ orderedList: false }), OrderedListStyled.configure({ styleDataFormat })],
        content
    });
}

/** `setContent` appends an empty trailing paragraph after a list; drop it before comparing. */
function html(editor: Editor): string {
    return editor.getHTML().replace(/<p><\/p>$/, "");
}

/** Places the cursor inside the first text node matching `text`. */
function placeCursorIn(editor: Editor, text: string): void {
    let target = -1;
    editor.state.doc.descendants((node, pos) => {
        if (target === -1 && node.isText && node.text === text) {
            target = pos + 1;
        }
    });
    editor.commands.setTextSelection(target);
}

describe("setOrderedListStart", () => {
    let editor: Editor;

    afterEach(() => {
        editor.destroy();
    });

    it("sets the start attribute on the list at the cursor", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>a</p></li><li><p>b</p></li></ol>");
        placeCursorIn(editor, "a");

        expect(editor.commands.setOrderedListStart(5)).toBe(true);
        expect(html(editor)).toBe('<ol start="5"><li><p>a</p></li><li><p>b</p></li></ol>');
    });

    it("keeps the list style in class mode", () => {
        editor = makeEditor("class");
        editor.commands.setContent('<ol data-list-style="lower-alpha"><li><p>a</p></li></ol>');
        placeCursorIn(editor, "a");

        editor.commands.setOrderedListStart(5);

        const ol = new DOMParser().parseFromString(html(editor), "text/html").querySelector("ol");
        expect(ol?.getAttribute("start")).toBe("5");
        expect(ol?.getAttribute("data-list-style")).toBe("lower-alpha");
    });

    it("removes the attribute when the start is 1", () => {
        editor = makeEditor();
        editor.commands.setContent('<ol start="5"><li><p>a</p></li></ol>');
        placeCursorIn(editor, "a");

        editor.commands.setOrderedListStart(1);

        expect(html(editor)).toBe("<ol><li><p>a</p></li></ol>");
    });

    it("treats null as a reset to 1", () => {
        editor = makeEditor();
        editor.commands.setContent('<ol start="5"><li><p>a</p></li></ol>');
        placeCursorIn(editor, "a");

        editor.commands.setOrderedListStart(null);

        expect(html(editor)).toBe("<ol><li><p>a</p></li></ol>");
    });

    it("changes only the innermost list", () => {
        editor = makeEditor();
        editor.commands.setContent("<ol><li><p>outer</p><ol><li><p>inner</p></li></ol></li></ol>");
        placeCursorIn(editor, "inner");

        editor.commands.setOrderedListStart(3);

        expect(html(editor)).toBe('<ol><li><p>outer</p><ol start="3"><li><p>inner</p></li></ol></li></ol>');
    });

    it("does nothing outside an ordered list", () => {
        editor = makeEditor();
        editor.commands.setContent("<p>text</p><ul><li><p>item</p></li></ul>");
        placeCursorIn(editor, "text");
        expect(editor.commands.setOrderedListStart(5)).toBe(false);

        placeCursorIn(editor, "item");
        expect(editor.commands.setOrderedListStart(5)).toBe(false);
        expect(html(editor)).toBe("<p>text</p><ul><li><p>item</p></li></ul>");
    });

    it("is undone in one step", () => {
        // Initial content, unlike `setContent`, is not in the undo history.
        editor = makeEditor("inline", "<ol><li><p>a</p></li></ol>");
        placeCursorIn(editor, "a");

        editor.commands.setOrderedListStart(12);
        editor.commands.undo();

        expect(html(editor)).toBe("<ol><li><p>a</p></li></ol>");
    });

    it("restores a stored start number on load", () => {
        editor = makeEditor();
        editor.commands.setContent('<ol start="7"><li><p>a</p></li></ol>');
        placeCursorIn(editor, "a");

        expect(editor.getAttributes("orderedList").start).toBe(7);
        expect(html(editor)).toBe('<ol start="7"><li><p>a</p></li></ol>');
    });
});
