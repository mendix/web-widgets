import { Editor } from "@tiptap/core";
import { TableRow } from "@tiptap/extension-table-row";
import { StarterKit } from "@tiptap/starter-kit";
import { TableBackgroundColor } from "../TableBackgroundColor";
import { TableCellBackgroundColor } from "../TableCellBackgroundColor";
import { TableHeaderBackgroundColor } from "../TableHeaderBackgroundColor";

type StyleFormat = "inline" | "class";

function makeEditor(styleDataFormat: StyleFormat = "inline"): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [
            StarterKit,
            TableBackgroundColor.configure({ resizable: true, styleDataFormat }),
            TableRow,
            TableHeaderBackgroundColor.configure({ styleDataFormat }),
            TableCellBackgroundColor.configure({ styleDataFormat })
        ]
    });
}

/** Places the cursor inside the first cell node of the given type ("tableHeader" | "tableCell"). */
function placeCursorInCell(editor: Editor, cellType: "tableHeader" | "tableCell"): void {
    let pos = 1;
    let found = false;
    editor.state.doc.descendants((node, nodePos) => {
        if (found) {
            return false;
        }
        if (node.type.name === cellType) {
            pos = nodePos + 1;
            found = true;
            return false;
        }
        return true;
    });
    editor.commands.setTextSelection(pos);
}

const TABLE_HTML = "<table><tbody>" + "<tr><th>Header</th></tr>" + "<tr><td>Data</td></tr>" + "</tbody></table>";

/** Extracts the opening `<th ...>` tag from serialized HTML. */
function thTag(html: string): string {
    const match = html.match(/<th[^>]*>/);
    return match ? match[0] : "";
}

/** Extracts the opening `<td ...>` tag from serialized HTML. */
function tdTag(html: string): string {
    const match = html.match(/<td[^>]*>/);
    return match ? match[0] : "";
}

/** True when the tag's inline style/data contains the given color in hex or rgb form. */
function hasColor(tag: string, hex: string): boolean {
    const rgb = hexToRgb(hex);
    return tag.includes(hex) || (rgb !== null && tag.includes(rgb));
}

/** Converts a #rrggbb hex string to a jsdom-style `rgb(r, g, b)` string. */
function hexToRgb(hex: string): string | null {
    const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    if (!match) {
        return null;
    }
    const [r, g, b] = [match[1], match[2], match[3]].map(part => parseInt(part, 16));
    return `rgb(${r}, ${g}, ${b})`;
}

describe("TableHeaderBackgroundColor — inline format", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("renders header background color inline", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInCell(editor, "tableHeader");

        editor.chain().focus().setCellAttribute("backgroundColor", "#ff0000").run();

        expect(hasColor(thTag(editor.getHTML()), "#ff0000")).toBe(true);
    });

    it("renders header border color/style/width inline", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInCell(editor, "tableHeader");

        editor
            .chain()
            .focus()
            .setCellAttribute("borderColor", "#123456")
            .setCellAttribute("borderStyle", "dashed")
            .setCellAttribute("borderWidth", "2px")
            .run();

        const tag = thTag(editor.getHTML());
        expect(tag).toContain("border-color: #123456");
        expect(tag).toContain("border-style: dashed");
        expect(tag).toContain("border-width: 2px");
    });

    it("exposes header border commands (setCellBorderColor)", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInCell(editor, "tableHeader");

        editor.chain().focus().setCellBorderColor("#abcdef").run();

        expect(thTag(editor.getHTML())).toContain("border-color: #abcdef");
    });
});

describe("TableHeaderBackgroundColor — class format", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("renders header background color as data attribute + class", () => {
        editor = makeEditor("class");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInCell(editor, "tableHeader");

        editor.chain().focus().setCellAttribute("backgroundColor", "#ff0000").run();

        const tag = thTag(editor.getHTML());
        expect(tag).toContain('data-background-color="#ff0000"');
        expect(tag).toContain("has-background-color");
        expect(tag).not.toContain("background-color: #ff0000");
    });

    it("renders header border properties as data attributes + class", () => {
        editor = makeEditor("class");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInCell(editor, "tableHeader");

        editor
            .chain()
            .focus()
            .setCellAttribute("borderColor", "#123456")
            .setCellAttribute("borderStyle", "dashed")
            .setCellAttribute("borderWidth", "2px")
            .run();

        const tag = thTag(editor.getHTML());
        expect(tag).toContain('data-border-color="#123456"');
        expect(tag).toContain('data-border-style="dashed"');
        expect(tag).toContain('data-border-width="2px"');
        expect(tag).toContain("has-cell-border");
    });
});

describe("TableHeaderBackgroundColor — round-trip parse/serialize", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("preserves inline header styling", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(
            '<table><tbody><tr><th style="background-color: #ff0000; border-style: dashed; border-width: 2px; border-color: #123456">Header</th></tr></tbody></table>'
        );

        const tag = thTag(editor.getHTML());
        expect(hasColor(tag, "#ff0000")).toBe(true);
        expect(tag).toContain("border-color: #123456");
        expect(tag).toContain("border-style: dashed");
        expect(tag).toContain("border-width: 2px");
    });

    it("preserves class-format header styling", () => {
        editor = makeEditor("class");
        editor.commands.setContent(
            '<table><tbody><tr><th class="has-background-color has-cell-border" data-background-color="#ff0000" data-border-color="#123456" data-border-style="dashed" data-border-width="2px">Header</th></tr></tbody></table>'
        );

        const tag = thTag(editor.getHTML());
        expect(tag).toContain('data-background-color="#ff0000"');
        expect(tag).toContain('data-border-color="#123456"');
        expect(tag).toContain('data-border-style="dashed"');
        expect(tag).toContain('data-border-width="2px"');
        expect(tag).toContain("has-background-color");
        expect(tag).toContain("has-cell-border");
    });
});

describe("TableHeaderBackgroundColor — validation", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("drops unsafe background color", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInCell(editor, "tableHeader");

        editor.chain().focus().setCellAttribute("backgroundColor", "red; content: url(evil)").run();

        expect(thTag(editor.getHTML())).not.toContain("content: url");
    });

    it("drops unsafe border style", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInCell(editor, "tableHeader");

        editor.chain().focus().setCellAttribute("borderStyle", "dashed; background: url(evil)").run();

        expect(thTag(editor.getHTML())).not.toContain("url(evil)");
    });
});

describe("TableCellBackgroundColor — parity (td unchanged after refactor)", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("renders data cell background color inline", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInCell(editor, "tableCell");

        editor.chain().focus().setCellAttribute("backgroundColor", "#00ff00").run();

        expect(hasColor(tdTag(editor.getHTML()), "#00ff00")).toBe(true);
    });

    it("renders data cell background color as data attribute + class", () => {
        editor = makeEditor("class");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInCell(editor, "tableCell");

        editor.chain().focus().setCellAttribute("backgroundColor", "#00ff00").run();

        const tag = tdTag(editor.getHTML());
        expect(tag).toContain('data-background-color="#00ff00"');
        expect(tag).toContain("has-background-color");
    });
});
