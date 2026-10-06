import { Editor } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { FontFamilyClass } from "../FontFamilyClass";
import { FontSize } from "../FontSize";
import { TextAlign } from "../TextAlignClass";
import { TextColorClass } from "../TextColorClass";
import { TextHighlightClass } from "../TextHighlightClass";
import { TextStyleClass } from "../TextStyleClass";

type StyleFormat = "inline" | "class";

function makeEditor(styleDataFormat: StyleFormat): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [
            StarterKit,
            TextStyleClass.configure({ styleDataFormat }),
            TextColorClass.configure({ types: ["textStyle"], styleDataFormat }),
            TextHighlightClass.configure({ multicolor: true, styleDataFormat }),
            FontFamilyClass.configure({ types: ["textStyle"], styleDataFormat }),
            FontSize.configure({ types: ["textStyle"], styleDataFormat }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
                alignments: ["left", "center", "right", "justify"],
                styleDataFormat
            })
        ]
    });
}

/** Selects all text in the document so mark commands apply to it. */
function selectAll(editor: Editor): void {
    editor.commands.setTextSelection({ from: 1, to: editor.state.doc.content.size - 1 });
}

let editor: Editor;
afterEach(() => editor?.destroy());

// Class mode: every text-mark extension serializes its value into a data-* attribute
// plus a marker class, and never into an inline `style` for that property. Loading the
// class/data form back must restore the same value so getHTML() is a fixed point.
describe("text-mark extensions — class format", () => {
    // Highlight is its own mark and TextAlign a node attribute, so both parse the class form.
    it.each([
        {
            name: "TextHighlightClass",
            html: '<p><span data-text-highlight="#ffff00" class="has-text-highlight">x</span></p>',
            expected: ['data-text-highlight="#ffff00"', "has-text-highlight"]
        },
        {
            name: "TextAlign (data attribute)",
            html: '<p data-text-align="center">x</p>',
            expected: ['data-text-align="center"', 'class="text-align-center"']
        },
        {
            name: "TextAlign (class only)",
            html: '<p class="text-align-justify">x</p>',
            expected: ['data-text-align="justify"', 'class="text-align-justify"']
        }
    ])("$name: loads the class/data form and emits it back without inline style", ({ html, expected }) => {
        editor = makeEditor("class");
        editor.commands.setContent(html);

        const out = editor.getHTML();
        for (const fragment of expected) {
            expect(out).toContain(fragment);
        }
        expect(out).not.toContain("style=");
    });

    it.each([
        {
            name: "setTextColor",
            apply: (e: Editor) => e.commands.setTextColor("#00ff00"),
            expected: ['data-text-color="#00ff00"', "has-text-color"]
        },
        {
            name: "setTextHighlight",
            apply: (e: Editor) => e.commands.setTextHighlight("#00ff00"),
            expected: ['data-text-highlight="#00ff00"', "has-text-highlight"]
        },
        {
            name: "setFontFamily",
            apply: (e: Editor) => e.commands.setFontFamily("Arial"),
            expected: ['data-font-family="Arial"', "has-font-family", 'data-font-value="arial"']
        },
        {
            name: "setFontSize",
            apply: (e: Editor) => e.commands.setFontSize("18px"),
            expected: ['data-font-size="18"', "has-font-size"]
        },
        {
            name: "setTextAlign",
            apply: (e: Editor) => e.commands.setTextAlign("right"),
            expected: ['data-text-align="right"', "text-align-right"]
        }
    ])("$name command writes the data-* form without inline style", ({ apply, expected }) => {
        editor = makeEditor("class");
        editor.commands.setContent("<p>x</p>");
        selectAll(editor);

        apply(editor);

        const out = editor.getHTML();
        for (const fragment of expected) {
            expect(out).toContain(fragment);
        }
        expect(out).not.toContain("style=");
    });

    it.each([
        { name: "setTextHighlight", apply: (e: Editor) => e.commands.setTextHighlight("#00ff00") },
        { name: "setTextAlign", apply: (e: Editor) => e.commands.setTextAlign("right") }
    ])("$name: setContent(getHTML()) round-trip is stable", ({ apply }) => {
        editor = makeEditor("class");
        editor.commands.setContent("<p>x</p>");
        selectAll(editor);
        apply(editor);
        const first = editor.getHTML();

        editor.commands.setContent(first);

        expect(editor.getHTML()).toBe(first);
    });

    // BEH-17: class mode writes these spans without a `style` attribute, so they must
    // still be recognised as textStyle marks when the saved content is loaded again.
    it.each([
        {
            name: "TextColorClass",
            html: '<p><span data-text-color="#00ff00" class="has-text-color">x</span></p>',
            attr: "textColor",
            value: "#00ff00"
        },
        {
            name: "FontFamilyClass",
            html: '<p><span data-font-family="Arial" data-font-value="arial" class="has-font-family">x</span></p>',
            attr: "fontFamily",
            value: "Arial"
        },
        {
            name: "FontSize",
            html: '<p><span data-font-size="18" class="has-font-size">x</span></p>',
            attr: "fontSize",
            value: "18"
        }
    ])("$name: loading the class/data form restores the mark attribute", ({ html, attr, value }) => {
        editor = makeEditor("class");
        editor.commands.setContent(html);
        selectAll(editor);

        expect(editor.getAttributes("textStyle")[attr]).toBe(value);
        expect(editor.getHTML()).not.toContain("style=");
    });

    it.each([
        {
            name: "setTextColor",
            apply: (e: Editor) => e.commands.setTextColor("#00ff00"),
            attr: "textColor",
            value: "#00ff00"
        },
        {
            name: "setFontFamily",
            apply: (e: Editor) => e.commands.setFontFamily("Arial"),
            attr: "fontFamily",
            value: "Arial"
        },
        // The class form stores only the number, so a reload yields the unitless value.
        { name: "setFontSize", apply: (e: Editor) => e.commands.setFontSize("18px"), attr: "fontSize", value: "18" }
    ])("$name: setContent(getHTML()) round-trip keeps the mark", ({ apply, attr, value }) => {
        editor = makeEditor("class");
        editor.commands.setContent("<p>x</p>");
        selectAll(editor);
        apply(editor);
        const first = editor.getHTML();

        editor.commands.setContent(first);
        selectAll(editor);

        expect(editor.getAttributes("textStyle")[attr]).toBe(value);
        expect(editor.getHTML()).toBe(first);
    });

    it("FontSize keeps only the leading number, dropping the unit", () => {
        editor = makeEditor("class");
        editor.commands.setContent("<p>x</p>");
        selectAll(editor);

        editor.commands.setFontSize("18.5px");

        expect(editor.getHTML()).toContain('data-font-size="18.5"');
    });

    it("FontFamilyClass derives a kebab-case data-font-value from the family", () => {
        editor = makeEditor("class");
        editor.commands.setContent("<p>x</p>");
        selectAll(editor);

        editor.commands.setFontFamily("'Times New Roman', serif");

        expect(editor.getHTML()).toContain('data-font-value="times-new-roman"');
    });
});

// Values are untrusted (pasted HTML, stored data). renderHTML must drop values that fail
// the extension's safety guard instead of re-emitting them.
describe("text-mark extensions — class format rejects unsafe values", () => {
    it.each([
        { name: "setTextColor", apply: (e: Editor) => e.commands.setTextColor("red;background:url(x)") },
        { name: "setTextHighlight", apply: (e: Editor) => e.commands.setTextHighlight("#fff;}<script>") },
        { name: "setFontFamily", apply: (e: Editor) => e.commands.setFontFamily("Arial;}body{display:none") },
        { name: "setFontSize", apply: (e: Editor) => e.commands.setFontSize("abc") }
    ])("$name with an unsafe value emits no data-* attribute", ({ apply }) => {
        editor = makeEditor("class");
        editor.commands.setContent("<p>x</p>");
        selectAll(editor);

        apply(editor);

        expect(editor.getHTML()).not.toMatch(/data-(text-color|text-highlight|font-family|font-size)=/);
    });

    it.each([
        {
            name: "TextHighlightClass",
            html: '<p><span data-text-highlight="#fff;}<b>">x</span></p>',
            attr: "data-text-highlight"
        },
        { name: "TextAlign", html: '<p data-text-align="center;color:red">x</p>', attr: 'data-text-align="center;' }
    ])("$name drops an unsafe value loaded from HTML", ({ html, attr }) => {
        editor = makeEditor("class");
        editor.commands.setContent(html);

        expect(editor.getHTML()).not.toContain(attr);
    });

    it("FontSize sanitizes an injected value down to its leading number", () => {
        editor = makeEditor("class");
        editor.commands.setContent("<p>x</p>");
        selectAll(editor);

        editor.commands.setFontSize("16px;color:red");

        const out = editor.getHTML();
        expect(out).toContain('data-font-size="16"');
        expect(out).not.toContain("color:red");
    });
});

// Sanity check that the inline branch is distinct: the same commands emit inline style.
// jsdom normalizes hex colors to rgb() when serializing the style attribute.
describe("text-mark extensions — inline format", () => {
    it.each([
        {
            name: "setTextColor",
            apply: (e: Editor) => e.commands.setTextColor("#00ff00"),
            style: "color: rgb(0, 255, 0)"
        },
        {
            name: "setTextHighlight",
            apply: (e: Editor) => e.commands.setTextHighlight("#00ff00"),
            style: "background-color: rgb(0, 255, 0)"
        },
        { name: "setFontFamily", apply: (e: Editor) => e.commands.setFontFamily("Arial"), style: "font-family: Arial" },
        { name: "setFontSize", apply: (e: Editor) => e.commands.setFontSize("18px"), style: "font-size: 18px" },
        { name: "setTextAlign", apply: (e: Editor) => e.commands.setTextAlign("right"), style: "text-align: right" }
    ])("$name emits inline style", ({ apply, style }) => {
        editor = makeEditor("inline");
        editor.commands.setContent("<p>x</p>");
        selectAll(editor);

        apply(editor);

        const out = editor.getHTML();
        expect(out).toContain(style);
        expect(out).not.toMatch(/data-(text-color|text-highlight|font-family|font-size|text-align)=/);
    });

    it("does not treat a class-mode span without inline style as a text style", () => {
        editor = makeEditor("inline");
        editor.commands.setContent('<p><span data-text-color="#00ff00" class="has-text-color">x</span></p>');

        expect(editor.getAttributes("textStyle").textColor).toBeUndefined();
        expect(editor.getHTML()).not.toContain("<span");
    });
});
