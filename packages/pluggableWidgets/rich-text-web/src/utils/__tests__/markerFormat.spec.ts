import { Editor } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { StarterKit } from "@tiptap/starter-kit";
import { FontFamilyClass } from "../../extensions/FontFamilyClass";
import { FontSize } from "../../extensions/FontSize";
import { ImageResize } from "../../extensions/ImageResize";
import { TextColorClass } from "../../extensions/TextColorClass";
import {
    computeMarkerFormat,
    computeMarkerLength,
    computeMaxMarkerSize,
    markerFormatToClassAttrs,
    markerFormatToInlineStyle,
    maxMarkerSizeToAttrs
} from "../markerFormat";

function makeEditor(): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [
            StarterKit,
            TextStyle,
            ImageResize.configure({ inline: true }),
            FontSize.configure({ types: ["textStyle"], styleDataFormat: "inline" }),
            FontFamilyClass.configure({ types: ["textStyle"], styleDataFormat: "inline" }),
            TextColorClass.configure({ types: ["textStyle"], styleDataFormat: "inline" })
        ]
    });
}

/** First node of the given type in the document. */
function firstNodeOfType(editor: Editor, typeName: string): ProseMirrorNode {
    let found: ProseMirrorNode | null = null;
    editor.state.doc.descendants(node => {
        if (found) {
            return false;
        }
        if (node.type.name === typeName) {
            found = node;
            return false;
        }
        return true;
    });
    if (!found) {
        throw new Error(`No ${typeName} node found`);
    }
    return found;
}

function markerFormatOf(editor: Editor, html: string): ReturnType<typeof computeMarkerFormat> {
    editor.commands.setContent(html);
    return computeMarkerFormat(firstNodeOfType(editor, "listItem"));
}

describe("computeMarkerFormat", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());
    beforeEach(() => {
        editor = makeEditor();
    });

    it("reads all five properties from the first inline run", () => {
        const format = markerFormatOf(
            editor,
            `<ul><li><p><strong><em><span style="font-size: 32px; color: rgb(255, 0, 0); font-family: Arial">Hi</span></em></strong></p></li></ul>`
        );

        expect(format).toEqual({
            fontSize: "32px",
            color: "rgb(255, 0, 0)",
            fontFamily: "Arial",
            bold: true,
            italic: true
        });
    });

    it("reads a font size applied to the whole item", () => {
        const format = markerFormatOf(editor, `<ol><li><p><span style="font-size: 32px">Hello</span></p></li></ol>`);

        expect(format).toEqual({ fontSize: "32px" });
    });

    it("reads a font size applied to only the first character", () => {
        const format = markerFormatOf(editor, `<ol><li><p><span style="font-size: 32px">H</span>ello</p></li></ol>`);

        expect(format).toEqual({ fontSize: "32px" });
    });

    it("ignores formatting that starts after the first character", () => {
        const format = markerFormatOf(editor, `<ol><li><p>He<span style="font-size: 32px">llo</span></p></li></ol>`);

        expect(format).toBeNull();
    });

    it("returns null for an unformatted item", () => {
        expect(markerFormatOf(editor, `<ol><li><p>plain</p></li></ol>`)).toBeNull();
    });

    it("returns null for an empty item", () => {
        expect(markerFormatOf(editor, `<ol><li><p></p></li></ol>`)).toBeNull();
    });

    it("returns null when the item starts with an inline image", () => {
        const format = markerFormatOf(
            editor,
            `<ol><li><p><img src="http://example.com/a.png"><span style="font-size: 32px">after</span></p></li></ol>`
        );

        expect(format).toBeNull();
    });

    it("returns null when the item starts with a hard break", () => {
        const format = markerFormatOf(
            editor,
            `<ol><li><p><br><span style="font-size: 32px">after</span></p></li></ol>`
        );

        expect(format).toBeNull();
    });

    it("reads bold alone without a textStyle mark", () => {
        expect(markerFormatOf(editor, `<ul><li><p><strong>bold</strong></p></li></ul>`)).toEqual({ bold: true });
    });

    it("evaluates each item independently", () => {
        editor.commands.setContent(
            `<ol><li><p><span style="font-size: 32px">big</span></p></li><li><p>small</p></li></ol>`
        );
        const list = firstNodeOfType(editor, "orderedList");

        expect(computeMarkerFormat(list.child(0))).toEqual({ fontSize: "32px" });
        expect(computeMarkerFormat(list.child(1))).toBeNull();
    });

    it("reads a nested item's own first run, not its parent's", () => {
        editor.commands.setContent(
            `<ul><li><p>outer</p><ul><li><p><span style="font-size: 42px">inner</span></p></li></ul></li></ul>`
        );
        const outer = firstNodeOfType(editor, "listItem");

        expect(computeMarkerFormat(outer)).toBeNull();
        expect(computeMarkerFormat(firstNodeOfType(editor, "bulletList").child(0).child(1).child(0))).toEqual({
            fontSize: "42px"
        });
    });

    it("drops an unsafe font size rather than emitting it", () => {
        const format = markerFormatOf(editor, `<ol><li><p><span style="font-size: 32px">ok</span></p></li></ol>`);
        expect(format?.fontSize).toBe("32px");

        // A value that is not a valid CSS size must not reach the marker.
        editor.commands.setContent(`<ol><li><p><span style="font-size: 32px">ok</span></p></li></ol>`);
        const item = firstNodeOfType(editor, "listItem");
        const textStyleType = editor.schema.marks.textStyle;
        const doctored = item.type.create(
            item.attrs,
            item.firstChild!.type.create(item.firstChild!.attrs, [
                editor.schema.text("ok", [textStyleType.create({ fontSize: "url(javascript:alert(1))" })])
            ])
        );

        expect(computeMarkerFormat(doctored)).toBeNull();
    });
});

describe("computeMaxMarkerSize", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());
    beforeEach(() => {
        editor = makeEditor();
    });

    it("returns the largest first-run size among direct items", () => {
        editor.commands.setContent(
            `<ol>` +
                `<li><p><span style="font-size: 20px">a</span></p></li>` +
                `<li><p><span style="font-size: 84px">b</span></p></li>` +
                `<li><p>c</p></li>` +
                `</ol>`
        );

        expect(computeMaxMarkerSize(firstNodeOfType(editor, "orderedList"))).toBe("84px");
    });

    it("returns null when no item has an enlarged marker", () => {
        editor.commands.setContent(`<ol><li><p>a</p></li><li><p>b</p></li></ol>`);

        expect(computeMaxMarkerSize(firstNodeOfType(editor, "orderedList"))).toBeNull();
    });

    it("ignores a nested list's items", () => {
        editor.commands.setContent(
            `<ul><li><p>outer</p><ul><li><p><span style="font-size: 84px">inner</span></p></li></ul></li></ul>`
        );

        expect(computeMaxMarkerSize(firstNodeOfType(editor, "bulletList"))).toBeNull();
    });
});

describe("computeMarkerLength", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());
    beforeEach(() => {
        editor = makeEditor();
    });

    function lengthOf(html: string, typeName = "orderedList"): number {
        editor.commands.setContent(html);
        return computeMarkerLength(firstNodeOfType(editor, typeName));
    }

    function items(count: number): string {
        return `<li><p>x</p></li>`.repeat(count);
    }

    it("counts the digits of the last item's number", () => {
        expect(lengthOf(`<ol>${items(9)}</ol>`)).toBe(1);
        expect(lengthOf(`<ol>${items(10)}</ol>`)).toBe(2);
        expect(lengthOf(`<ol>${items(100)}</ol>`)).toBe(3);
    });

    it("accounts for a start offset, which shifts every number up", () => {
        expect(lengthOf(`<ol start="998">${items(3)}</ol>`)).toBe(4);
    });

    it("returns 1 for a bullet list, whose marker is a single glyph", () => {
        expect(lengthOf(`<ul>${items(100)}</ul>`, "bulletList")).toBe(1);
    });

    it("counts alphabetic markers, which stay one character through z", () => {
        expect(lengthOf(`<ol type="a">${items(26)}</ol>`)).toBe(1);
        expect(lengthOf(`<ol type="a">${items(27)}</ol>`)).toBe(2);
    });

    it("counts roman markers by numeral length, not by digits", () => {
        // "viii" is four characters where the decimal 8 is one.
        expect(lengthOf(`<ol type="i">${items(8)}</ol>`)).toBe(4);
        expect(lengthOf(`<ol type="i">${items(38)}</ol>`)).toBe(7); // xxxviii
    });

    it("ignores nested items, which belong to their own list", () => {
        expect(lengthOf(`<ol><li><p>a</p><ol>${items(20)}</ol></li></ol>`)).toBe(1);
    });
});

describe("marker format serializers", () => {
    it("emits custom properties for inline mode", () => {
        const style = markerFormatToInlineStyle({
            fontSize: "32px",
            color: "red",
            fontFamily: "Arial",
            bold: true,
            italic: true
        });

        expect(style).toBe(
            "--rt-marker-font-size: 32px; --rt-marker-color: red; --rt-marker-font-family: Arial; " +
                "--rt-marker-font-weight: bold; --rt-marker-font-style: italic"
        );
    });

    it("emits only the properties that are set", () => {
        expect(markerFormatToInlineStyle({ fontSize: "20px" })).toBe("--rt-marker-font-size: 20px");
    });

    it("emits one class per property for class mode", () => {
        const attrs = markerFormatToClassAttrs({
            fontSize: "32px",
            color: "red",
            fontFamily: "Arial",
            bold: true,
            italic: true
        });

        expect(attrs).toEqual({
            "data-marker-font-size": "32",
            "data-marker-color": "red",
            "data-marker-font-family": "Arial",
            class: "has-marker-font-size has-marker-color has-marker-font-family has-marker-bold has-marker-italic"
        });
    });

    it("omits classes for properties that are not set", () => {
        expect(markerFormatToClassAttrs({ italic: true })).toEqual({ class: "has-marker-italic" });
    });
});

describe("maxMarkerSizeToAttrs", () => {
    it("emits nothing when no item has an enlarged marker", () => {
        expect(maxMarkerSizeToAttrs(null, "inline", 3)).toEqual({});
        expect(maxMarkerSizeToAttrs(null, "class", 3)).toEqual({});
    });

    it("omits the character count at 1, keeping the markup as it was before this feature", () => {
        expect(maxMarkerSizeToAttrs("84px", "inline")).toEqual({ style: "--rt-marker-max-size: 84px" });
        expect(maxMarkerSizeToAttrs("84px", "class")).toEqual({
            "data-marker-max-size": "84",
            class: "has-marker-gutter"
        });
    });

    it("emits the character count above 1, so the gutter fits the longest marker", () => {
        expect(maxMarkerSizeToAttrs("84px", "inline", 3)).toEqual({
            style: "--rt-marker-max-size: 84px; --rt-marker-chars: 3"
        });
        expect(maxMarkerSizeToAttrs("84px", "class", 3)).toEqual({
            "data-marker-max-size": "84",
            "data-marker-chars": "3",
            class: "has-marker-gutter has-marker-chars"
        });
    });
});
