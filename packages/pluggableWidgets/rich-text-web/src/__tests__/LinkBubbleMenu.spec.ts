import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";

function makeEditor(content: string): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [StarterKit.configure({ link: { openOnClick: false } })],
        content
    });
}

/** Place a collapsed caret inside the first occurrence of the given text. */
function placeCaretInText(editor: Editor, text: string): void {
    let target = -1;
    editor.state.doc.descendants((node, pos) => {
        if (target === -1 && node.isText && node.text?.includes(text)) {
            target = pos + (node.text.indexOf(text) + 1);
            return false;
        }
        return true;
    });
    editor.commands.setTextSelection(target);
}

// Mirrors the predicate used by LinkBubbleMenu's shouldShow.
function shouldShow(editor: Editor, isEditing: boolean): boolean {
    return editor.isEditable && editor.isActive("link") && !isEditing;
}

describe("LinkBubbleMenu behavior", () => {
    describe("shouldShow", () => {
        it("is true when the caret is inside a link and editable", () => {
            const editor = makeEditor('<p><a href="https://a.com">linked</a> plain</p>');
            placeCaretInText(editor, "linked");

            expect(shouldShow(editor, false)).toBe(true);
        });

        it("is false when the caret is not inside a link", () => {
            const editor = makeEditor('<p><a href="https://a.com">linked</a> plain</p>');
            placeCaretInText(editor, "plain");

            expect(shouldShow(editor, false)).toBe(false);
        });

        it("is false while the dialog is open (isEditing)", () => {
            const editor = makeEditor('<p><a href="https://a.com">linked</a></p>');
            placeCaretInText(editor, "linked");

            expect(shouldShow(editor, true)).toBe(false);
        });

        it("is false when the editor is not editable", () => {
            const editor = makeEditor('<p><a href="https://a.com">linked</a></p>');
            placeCaretInText(editor, "linked");
            editor.setEditable(false);

            expect(shouldShow(editor, false)).toBe(false);
        });
    });

    describe("remove", () => {
        it("strips the whole link from a bare caret", () => {
            const editor = makeEditor('<p><a href="https://a.com">linked</a></p>');
            placeCaretInText(editor, "linked");

            editor.chain().focus().extendMarkRange("link").unsetLink().run();

            expect(editor.isActive("link")).toBe(false);
            expect(editor.getHTML()).not.toContain("<a");
            expect(editor.getText()).toBe("linked");
        });
    });

    describe("edit", () => {
        it("selects the full link range from a bare caret so the dialog can prefill", () => {
            const editor = makeEditor('<p><a href="https://a.com">linked</a></p>');
            placeCaretInText(editor, "linked");
            expect(editor.state.selection.empty).toBe(true);

            editor.chain().focus().extendMarkRange("link").run();

            const { from, to } = editor.state.selection;
            expect(editor.state.doc.textBetween(from, to)).toBe("linked");
            expect(editor.getAttributes("link").href).toBe("https://a.com");
        });
    });
});
