import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { ReactElement } from "react";
import { EditorContext } from "../components/EditorContext";
import { LinkBubbleMenu } from "../components/LinkBubbleMenu";

// jsdom has no layout: ProseMirror's coordsAtPos (used by the BubbleMenu to position itself)
// needs Range rects, so stub them with an empty rect.
const emptyRect = (): DOMRect =>
    ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) }) as DOMRect;
beforeAll(() => {
    Range.prototype.getBoundingClientRect = emptyRect;
    Range.prototype.getClientRects = (() => [emptyRect()]) as unknown as Range["getClientRects"];
});

const LINK_HTML = '<p><a href="https://a.com">linked</a> plain</p>';

function makeEditor(content: string, editable = true): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        editable,
        extensions: [StarterKit.configure({ link: { openOnClick: false } })],
        content
    });
}

function withEditor(editor: Editor): ReactElement {
    return (
        <EditorContext.Provider
            value={{
                editor: editor as any,
                codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                codeViewDispatch: () => undefined,
                dialogStyle: "inline",
                imageConfig: { enableDefaultUpload: false, hasImageSource: false }
            }}
        >
            <LinkBubbleMenu />
        </EditorContext.Provider>
    );
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
    act(() => {
        editor.commands.setTextSelection(target);
    });
}

const editButton = (): HTMLElement | null => screen.queryByTitle("Edit link");
const removeButton = (): HTMLElement | null => screen.queryByTitle("Remove link");

// Contract: the real LinkBubbleMenu (Tiptap BubbleMenu with pluginKey "linkBubbleMenu") is attached
// to the document — and so exposes its Edit/Remove buttons — only while the caret sits inside a
// link of an editable editor and the edit dialog is not open.
describe("LinkBubbleMenu", () => {
    let editor: Editor;

    afterEach(() => {
        editor?.destroy();
        document.body.innerHTML = "";
    });

    describe("visibility", () => {
        it("shows Edit and Remove when the caret is inside a link", () => {
            editor = makeEditor(LINK_HTML);
            render(withEditor(editor));

            placeCaretInText(editor, "linked");

            expect(editButton()).toBeInTheDocument();
            expect(removeButton()).toBeInTheDocument();
        });

        it("hides the menu when the caret is outside a link", () => {
            editor = makeEditor(LINK_HTML);
            render(withEditor(editor));

            placeCaretInText(editor, "linked");
            placeCaretInText(editor, "plain");

            expect(editButton()).not.toBeInTheDocument();
            expect(removeButton()).not.toBeInTheDocument();
        });

        it("does not show the menu when the editor is not editable", () => {
            editor = makeEditor(LINK_HTML, false);
            render(withEditor(editor));

            placeCaretInText(editor, "linked");

            // The caret really is in the link; only editability keeps the menu away.
            expect(editor.isActive("link")).toBe(true);
            expect(editButton()).not.toBeInTheDocument();
        });

        it("hides the menu while the edit dialog is open", async () => {
            editor = makeEditor(LINK_HTML);
            render(withEditor(editor));
            placeCaretInText(editor, "linked");

            fireEvent.click(editButton()!);
            // Edit extends the selection over the link; range selections are re-evaluated after
            // the BubbleMenu's update delay.
            await act(() => new Promise(resolve => setTimeout(resolve, 300)));

            expect(screen.getByRole("heading", { name: "Edit Link" })).toBeInTheDocument();
            expect(editButton()).not.toBeInTheDocument();
        });

        it("renders nothing without an editor in context", () => {
            const { container } = render(
                <EditorContext.Provider
                    value={{
                        editor: null,
                        codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                        codeViewDispatch: () => undefined,
                        dialogStyle: "inline",
                        imageConfig: { enableDefaultUpload: false, hasImageSource: false }
                    }}
                >
                    <LinkBubbleMenu />
                </EditorContext.Provider>
            );

            expect(container).toBeEmptyDOMElement();
            expect(editButton()).not.toBeInTheDocument();
        });
    });

    describe("actions", () => {
        it("Remove strips the whole link from a bare caret", () => {
            editor = makeEditor(LINK_HTML);
            render(withEditor(editor));
            placeCaretInText(editor, "linked");

            fireEvent.click(removeButton()!);

            expect(editor.getHTML()).not.toContain("<a");
            expect(editor.getText()).toBe("linked plain");
        });

        it("Edit opens the link dialog prefilled with the link's href and text", () => {
            editor = makeEditor(LINK_HTML);
            render(withEditor(editor));
            placeCaretInText(editor, "linked");

            fireEvent.click(editButton()!);

            expect(screen.getByRole("heading", { name: "Edit Link" })).toBeInTheDocument();
            expect(screen.getByLabelText("URL")).toHaveValue("https://a.com");
            expect(screen.getByLabelText(/^Text/)).toHaveValue("linked");
        });
    });
});
