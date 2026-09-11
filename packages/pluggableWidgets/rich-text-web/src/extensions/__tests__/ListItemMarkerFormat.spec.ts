import { Editor } from "@tiptap/core";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextStyle } from "@tiptap/extension-text-style";
import { StarterKit } from "@tiptap/starter-kit";
import { BulletListStyled } from "../BulletListStyled";
import { FontSize } from "../FontSize";
import { ListItemMarkerFormat } from "../ListItemMarkerFormat";
import { OrderedListStyled } from "../OrderedListStyled";

type StyleDataFormat = "inline" | "class";

/** Mirrors the list-related extension set that `Editor.tsx` builds. */
function makeEditor(styleDataFormat: StyleDataFormat = "inline"): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [
            StarterKit.configure({ orderedList: false, bulletList: false, listItem: false }),
            OrderedListStyled.configure({ styleDataFormat }),
            BulletListStyled.configure({ styleDataFormat }),
            ListItemMarkerFormat.configure({ styleDataFormat }),
            TextStyle,
            TaskList,
            TaskItem.configure({ nested: true }),
            FontSize.configure({ types: ["textStyle"], styleDataFormat })
        ]
    });
}

/**
 * `setContent` appends an empty trailing paragraph when the document ends in a list. That is
 * unrelated to marker format, so it is dropped before comparing.
 */
function setAndGet(editor: Editor, html: string): string {
    editor.commands.setContent(html);
    return editor.getHTML().replace(/<p><\/p>$/, "");
}

/** The first `<li>` in the live editor view, i.e. after decorations are applied. */
function liveListItem(editor: Editor): HTMLElement {
    const li = editor.view.dom.querySelector("li");
    if (!li) {
        throw new Error("No <li> in the editor view");
    }
    return li as HTMLElement;
}

/**
 * Applies a font size through the toolbar command path.
 *
 * Class-mode markup cannot be used as a test input: `textStyle`'s only parse rule requires a
 * `style` attribute, so a `<span class="has-font-size" data-font-size="32">` is discarded on
 * parse. Driving the command reaches the same document state either way.
 */
function setFontSizeOnAll(editor: Editor, size: string): void {
    editor.commands.selectAll();
    editor.commands.setFontSize(size);
}

describe("ListItemMarkerFormat", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    describe("inline mode", () => {
        beforeEach(() => {
            editor = makeEditor("inline");
        });

        it("publishes the first run's format as custom properties on the li", () => {
            const html = setAndGet(editor, `<ol><li><p><span style="font-size: 32px">Hello</span></p></li></ol>`);

            expect(html).toContain(`<li style="--rt-marker-font-size: 32px`);
        });

        it("publishes the gutter size on the list", () => {
            const html = setAndGet(editor, `<ul><li><p><span style="font-size: 48px">big</span></p></li></ul>`);

            expect(html).toContain(`<ul style="--rt-marker-max-size: 48px`);
        });

        it("leaves an unformatted list byte-identical", () => {
            const source = `<ol><li><p>one</p></li><li><p>two</p></li></ol>`;

            expect(setAndGet(editor, source)).toBe(source);
        });

        it("emits nothing for a task list", () => {
            const html = setAndGet(
                editor,
                `<ul data-type="taskList"><li data-type="taskItem" data-checked="false">` +
                    `<p><span style="font-size: 32px">task</span></p></li></ul>`
            );

            expect(html).toContain("font-size: 32px");
            expect(html).not.toContain("--rt-marker");
        });

        it("keeps the ordered list's start and type attributes", () => {
            const html = setAndGet(
                editor,
                `<ol start="3" type="a"><li><p><span style="font-size: 32px">c</span></p></li></ol>`
            );

            expect(html).toContain(`start="3"`);
            expect(html).toContain(`type="a"`);
            expect(html).toContain("--rt-marker-max-size: 32px");
        });

        it("marks only the item whose first run is formatted", () => {
            editor.commands.setContent(`<ol><li><p>one</p></li><li><p>two</p></li></ol>`);
            // Select just the first character of the first item and enlarge it.
            // ol opens at 0, li at 1, p at 2, so the text "one" starts at 3.
            editor.commands.setTextSelection({ from: 3, to: 4 });
            editor.commands.setFontSize("32px");
            const html = editor.getHTML();

            expect(html).toContain(`<li style="--rt-marker-font-size: 32px`);
            expect(html).toContain(`<li><p>two</p></li>`);
        });
    });

    describe("class mode", () => {
        beforeEach(() => {
            editor = makeEditor("class");
        });

        it("publishes per-property classes and data attributes", () => {
            editor.commands.setContent(`<ol><li><p>Hello</p></li></ol>`);
            setFontSizeOnAll(editor, "32px");
            const html = editor.getHTML();

            expect(html).toContain(`data-marker-font-size="32"`);
            expect(html).toContain("has-marker-font-size");
            expect(html).toContain(`data-marker-max-size="32"`);
            expect(html).toContain("has-marker-gutter");
        });

        it("leaves an unformatted list byte-identical", () => {
            const source = `<ul><li><p>one</p></li></ul>`;

            expect(setAndGet(editor, source)).toBe(source);
        });
    });

    // The two delivery paths — `renderHTML` for `getHTML()`, decorations for the live view —
    // must not drift, so both are asserted against the same document. Class mode is used
    // because its attributes survive jsdom, whose `style.cssText` drops custom properties.
    describe("view and getHTML agreement", () => {
        beforeEach(() => {
            editor = makeEditor("class");
        });

        it("marks the live li the same way getHTML does", () => {
            editor.commands.setContent(`<ol><li><p>Hello</p></li></ol>`);
            setFontSizeOnAll(editor, "32px");
            const li = liveListItem(editor);

            expect(li.classList.contains("has-marker-font-size")).toBe(true);
            expect(li.getAttribute("data-marker-font-size")).toBe("32");
            expect(editor.getHTML()).toContain(`data-marker-font-size="32"`);
        });

        it("refreshes the live li when only the first run's format changes", () => {
            // `toDOM` is not re-invoked here: `sameMarkup` compares type, attrs and marks but
            // not content, so without the decoration plugin the <li> would keep 32.
            editor.commands.setContent(`<ol><li><p>Hello</p></li></ol>`);
            setFontSizeOnAll(editor, "32px");
            expect(liveListItem(editor).getAttribute("data-marker-font-size")).toBe("32");

            setFontSizeOnAll(editor, "48px");

            expect(liveListItem(editor).getAttribute("data-marker-font-size")).toBe("48");
            expect(editor.getHTML()).toContain(`data-marker-font-size="48"`);
        });

        it("clears the live li when the format is removed", () => {
            editor.commands.setContent(`<ol><li><p>Hello</p></li></ol>`);
            setFontSizeOnAll(editor, "32px");

            editor.commands.selectAll();
            editor.commands.unsetFontSize();

            expect(liveListItem(editor).hasAttribute("data-marker-font-size")).toBe(false);
            expect(editor.getHTML()).not.toContain("data-marker-font-size");
        });
    });

    describe("stale and legacy content", () => {
        beforeEach(() => {
            editor = makeEditor("inline");
        });

        it("discards marker data that disagrees with the content", () => {
            // What a paste from a document whose first run was since unformatted looks like.
            const html = setAndGet(
                editor,
                `<ol style="--rt-marker-max-size: 99px">` +
                    `<li style="--rt-marker-font-size: 99px; --rt-marker-font-weight: bold"><p>plain</p></li>` +
                    `</ol>`
            );

            expect(html).not.toContain("99px");
            expect(html).not.toContain("--rt-marker");
        });

        it("recomputes stale marker data from the content that is actually there", () => {
            const html = setAndGet(
                editor,
                `<ol><li style="--rt-marker-font-size: 99px">` +
                    `<p><span style="font-size: 32px">Hello</span></p></li></ol>`
            );

            expect(html).toContain("--rt-marker-font-size: 32px");
            expect(html).not.toContain("99px");
        });

        it("renders a marker for legacy content that carries no marker data", () => {
            const html = setAndGet(editor, `<ul><li><p><span style="font-size: 42px">legacy</span></p></li></ul>`);

            expect(html).toContain("--rt-marker-font-size: 42px");
            // The stored inline font size is untouched; the marker data is purely additive.
            expect(html).toContain("font-size: 42px");
        });
    });
});
