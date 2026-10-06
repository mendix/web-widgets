import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { ReactElement } from "react";
import { EditorContext } from "../../../EditorContext";
import { LinkDialog } from "../LinkDialog";

const URL_ERROR = "Enter a valid URL (http, https, mailto or tel).";

function makeEditor(content: string): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [StarterKit.configure({ link: { openOnClick: false } })],
        content
    });
}

function withEditor(editor: Editor, onClose: () => void): ReactElement {
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
            <LinkDialog onClose={onClose} referenceElement={null} />
        </EditorContext.Provider>
    );
}

/** Select the first occurrence of `text` in the document. */
function selectText(editor: Editor, text: string): void {
    let from = -1;
    editor.state.doc.descendants((node, pos) => {
        if (from === -1 && node.isText && node.text?.includes(text)) {
            from = pos + node.text.indexOf(text);
            return false;
        }
        return true;
    });
    editor.commands.setTextSelection({ from, to: from + text.length });
}

function fillAndSubmit(fields: { url: string; text?: string }): void {
    fireEvent.change(screen.getByLabelText("URL"), { target: { value: fields.url } });
    if (fields.text !== undefined) {
        fireEvent.change(screen.getByLabelText(/^Text/), { target: { value: fields.text } });
    }
    fireEvent.submit(screen.getByLabelText("URL").closest("form")!);
}

// Contract (LinkDialog handleSubmit): unsafe URL schemes are rejected with the translated
// `link.urlError` message and nothing is inserted; otherwise the link wraps the current selection,
// replaces it with new link text, or — without a selection — inserts the text (or the URL itself).
describe("LinkDialog submit", () => {
    let editor: Editor;
    let onClose: jest.Mock;

    beforeEach(() => {
        onClose = jest.fn();
    });

    afterEach(() => {
        editor?.destroy();
        document.body.innerHTML = "";
    });

    describe("URL validation", () => {
        it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:msgbox(1)"])(
            "rejects %s with the translated error and inserts no link",
            url => {
                editor = makeEditor("<p>hello</p>");
                render(withEditor(editor, onClose));

                fillAndSubmit({ url });

                expect(screen.getByRole("alert")).toHaveTextContent(URL_ERROR);
                expect(screen.getByLabelText("URL")).toHaveAttribute("aria-invalid", "true");
                expect(screen.getByLabelText("URL")).toHaveAttribute("aria-describedby", "link-url-error");
                expect(editor.getHTML()).not.toContain("<a");
                expect(onClose).not.toHaveBeenCalled();
            }
        );

        it("clears the error once the URL is edited", () => {
            editor = makeEditor("<p>hello</p>");
            render(withEditor(editor, onClose));

            fillAndSubmit({ url: "javascript:alert(1)" });
            fireEvent.change(screen.getByLabelText("URL"), { target: { value: "https://example.com" } });

            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
            expect(screen.getByLabelText("URL")).not.toHaveAttribute("aria-invalid");
        });

        it("disables submit while the URL is blank", () => {
            editor = makeEditor("<p>hello</p>");
            render(withEditor(editor, onClose));

            fireEvent.change(screen.getByLabelText("URL"), { target: { value: "   " } });

            expect(screen.getByRole("button", { name: "Insert" })).toBeDisabled();
        });
    });

    describe("with a text selection", () => {
        it("wraps the selection in a link with the href", () => {
            editor = makeEditor("<p>hello world</p>");
            selectText(editor, "world");
            render(withEditor(editor, onClose));

            expect(screen.getByLabelText(/^Text/)).toHaveValue("world");
            fillAndSubmit({ url: "https://example.com" });

            const anchor = editor.view.dom.querySelector("a");
            expect(anchor).toHaveAttribute("href", "https://example.com");
            expect(anchor).toHaveTextContent(/^world$/);
            expect(editor.getText()).toBe("hello world");
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("replaces the selection with the new link text", () => {
            editor = makeEditor("<p>hello world</p>");
            selectText(editor, "world");
            render(withEditor(editor, onClose));

            fillAndSubmit({ url: "https://example.com", text: "there" });

            const anchor = editor.view.dom.querySelector("a");
            expect(anchor).toHaveAttribute("href", "https://example.com");
            expect(anchor).toHaveTextContent(/^there$/);
            expect(editor.getText()).toBe("hello there");
        });
    });

    describe("without a selection", () => {
        it("inserts the link text as a link", () => {
            editor = makeEditor("<p>hello</p>");
            editor.commands.setTextSelection(editor.state.doc.content.size - 1);
            render(withEditor(editor, onClose));

            fillAndSubmit({ url: "https://example.com", text: "site" });

            const anchor = editor.view.dom.querySelector("a");
            expect(anchor).toHaveAttribute("href", "https://example.com");
            expect(anchor).toHaveTextContent(/^site$/);
            expect(editor.getText()).toBe("hellosite");
        });

        it("inserts the URL itself as link text when no text is given", () => {
            editor = makeEditor("<p>hello</p>");
            editor.commands.setTextSelection(editor.state.doc.content.size - 1);
            render(withEditor(editor, onClose));

            fillAndSubmit({ url: "  https://example.com  " });

            const anchor = editor.view.dom.querySelector("a");
            expect(anchor).toHaveAttribute("href", "https://example.com");
            expect(anchor).toHaveTextContent(/^https:\/\/example\.com$/);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("applies the chosen target and title", () => {
            editor = makeEditor("<p>hello</p>");
            editor.commands.setTextSelection(editor.state.doc.content.size - 1);
            render(withEditor(editor, onClose));

            fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: "Tip" } });
            fireEvent.click(screen.getByLabelText("New window"));
            fillAndSubmit({ url: "https://example.com" });

            const anchor = editor.view.dom.querySelector("a");
            expect(anchor).toHaveAttribute("target", "_blank");
            expect(anchor).toHaveAttribute("title", "Tip");
        });
    });
});
