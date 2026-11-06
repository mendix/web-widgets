import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { ReactElement } from "react";
import { OrderedListStyled } from "../../../../extensions/OrderedListStyled";
import { EditorContext } from "../../../EditorContext";
import { TOOLBAR_GROUPS, ToolbarButtonConfig } from "../../ToolbarConfig";
import { ToolbarSplitButton } from "../ToolbarSplitButton";

const orderedListConfig = TOOLBAR_GROUPS.flatMap(group => group.buttons).find(
    button => button.name === "orderedList"
) as ToolbarButtonConfig;

function makeEditor(content: string): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [StarterKit.configure({ orderedList: false }), OrderedListStyled],
        content
    });
}

function placeCursorIn(editor: Editor, text: string): void {
    let target = -1;
    editor.state.doc.descendants((node, pos) => {
        if (target === -1 && node.isText && node.text === text) {
            target = pos + 1;
        }
    });
    act(() => {
        editor.commands.setTextSelection(target);
    });
}

function renderSplitButton(editor: Editor): ReturnType<typeof render> {
    return render(
        <EditorContext.Provider
            value={{
                editor,
                codeViewState: { isCodeView: false, htmlCode: "", showConfirm: false },
                codeViewDispatch: () => undefined,
                dialogStyle: "inline",
                imageConfig: { enableDefaultUpload: true, hasImageSource: false }
            }}
        >
            {(<ToolbarSplitButton config={orderedListConfig} />) as ReactElement}
        </EditorContext.Provider>
    );
}

function openDropdown(): HTMLInputElement {
    fireEvent.click(screen.getByLabelText("Numbered List - Style options"));
    return screen.getByRole("spinbutton", { name: "Start at" }) as HTMLInputElement;
}

function listHtml(editor: Editor): string {
    return editor.getHTML().replace(/<p><\/p>$/, "");
}

describe("ToolbarSplitButton start number", () => {
    let editor: Editor;

    afterEach(() => {
        editor.destroy();
    });

    it("shows the current start number in a labelled group", () => {
        editor = makeEditor('<ol start="4"><li><p>a</p></li></ol>');
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        const input = openDropdown();

        expect(input).toHaveValue(4);
        expect(input).toBeEnabled();
        expect(screen.getByRole("group", { name: "Start at" })).toContainElement(input);
    });

    it("shows 1 for a list without start attribute", () => {
        editor = makeEditor("<ol><li><p>a</p></li></ol>");
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        expect(openDropdown()).toHaveValue(1);
    });

    it("is disabled outside an ordered list", () => {
        editor = makeEditor("<p>text</p>");
        placeCursorIn(editor, "text");
        renderSplitButton(editor);

        expect(openDropdown()).toBeDisabled();
    });

    it("applies the value on Enter and closes the dropdown", () => {
        editor = makeEditor("<ol><li><p>a</p></li><li><p>b</p></li></ol>");
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        const input = openDropdown();
        fireEvent.change(input, { target: { value: "5" } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(listHtml(editor)).toBe('<ol start="5"><li><p>a</p></li><li><p>b</p></li></ol>');
        expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    });

    it("does not apply while typing", () => {
        editor = makeEditor("<ol><li><p>a</p></li></ol>");
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        fireEvent.change(openDropdown(), { target: { value: "12" } });

        expect(listHtml(editor)).toBe("<ol><li><p>a</p></li></ol>");
    });

    it("applies the value on blur", () => {
        editor = makeEditor("<ol><li><p>a</p></li></ol>");
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        const input = openDropdown();
        fireEvent.change(input, { target: { value: "8" } });
        fireEvent.blur(input);

        expect(listHtml(editor)).toBe('<ol start="8"><li><p>a</p></li></ol>');
    });

    it("applies the value when the dropdown closes by a click outside", () => {
        editor = makeEditor("<ol><li><p>a</p></li></ol>");
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        fireEvent.change(openDropdown(), { target: { value: "8" } });
        fireEvent.mouseDown(document.body);

        expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
        expect(listHtml(editor)).toBe('<ol start="8"><li><p>a</p></li></ol>');
    });

    it("discards the typed value on Escape", () => {
        editor = makeEditor('<ol start="2"><li><p>a</p></li></ol>');
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        const input = openDropdown();
        fireEvent.change(input, { target: { value: "9" } });
        fireEvent.keyDown(input, { key: "Escape" });
        fireEvent.blur(input);

        expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
        expect(listHtml(editor)).toBe('<ol start="2"><li><p>a</p></li></ol>');
    });

    it.each(["0", "-2", "2.5"])("rejects %p and reverts the input", value => {
        editor = makeEditor('<ol start="5"><li><p>a</p></li></ol>');
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        const input = openDropdown();
        fireEvent.change(input, { target: { value } });
        fireEvent.blur(input);

        expect(input).toHaveValue(5);
        expect(listHtml(editor)).toBe('<ol start="5"><li><p>a</p></li></ol>');
    });

    it("clamps values above the maximum", () => {
        editor = makeEditor("<ol><li><p>a</p></li></ol>");
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        const input = openDropdown();
        fireEvent.change(input, { target: { value: "20000" } });
        fireEvent.blur(input);

        expect(editor.getAttributes("orderedList").start).toBe(9999);
    });

    it("resets to 1 when cleared", () => {
        editor = makeEditor('<ol start="5"><li><p>a</p></li></ol>');
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        const input = openDropdown();
        fireEvent.change(input, { target: { value: "" } });
        fireEvent.blur(input);

        expect(listHtml(editor)).toBe("<ol><li><p>a</p></li></ol>");
    });

    it("keeps the start number when a style is chosen", () => {
        editor = makeEditor('<ol start="5"><li><p>a</p></li></ol>');
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        openDropdown();
        fireEvent.click(screen.getByRole("menuitem", { name: "a, b, c" }));

        expect(editor.getAttributes("orderedList")).toMatchObject({ start: 5, listStyleType: "lower-alpha" });
    });

    it("moves focus from the last style option to the input with ArrowDown", () => {
        editor = makeEditor("<ol><li><p>a</p></li></ol>");
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        const input = openDropdown();
        const lastOption = screen.getByRole("menuitem", { name: "i, ii, iii" });
        lastOption.focus();
        fireEvent.keyDown(lastOption, { key: "ArrowDown" });

        expect(input).toHaveFocus();
    });

    it("does not carry the start number to a new list", () => {
        // The paragraph in between keeps the new list from joining the first one.
        editor = makeEditor("<ol><li><p>a</p></li></ol><p>gap</p><p>b</p>");
        placeCursorIn(editor, "a");
        renderSplitButton(editor);

        const input = openDropdown();
        fireEvent.change(input, { target: { value: "5" } });
        fireEvent.keyDown(input, { key: "Enter" });

        placeCursorIn(editor, "b");
        fireEvent.click(screen.getByLabelText("Numbered List - Toggle"));

        // Only `start` is asserted: the list style is sticky across tests by design.
        const lists = editor.view.dom.querySelectorAll("ol");
        expect(lists).toHaveLength(2);
        expect(lists[0]).toHaveAttribute("start", "5");
        expect(lists[1]).not.toHaveAttribute("start");
    });
});
