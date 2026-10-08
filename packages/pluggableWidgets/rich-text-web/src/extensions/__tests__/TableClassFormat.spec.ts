import { Editor } from "@tiptap/core";
import { TableRow } from "@tiptap/extension-table-row";
import { StarterKit } from "@tiptap/starter-kit";
import { TableBackgroundColor } from "../TableBackgroundColor";
import { TableCellBackgroundColor } from "../TableCellBackgroundColor";
import { TableHeaderBackgroundColor } from "../TableHeaderBackgroundColor";

type StyleFormat = "inline" | "class";

function makeEditor(styleDataFormat: StyleFormat): Editor {
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

/** Places the cursor inside the paragraph of the first data cell. */
function placeCursorInFirstCell(editor: Editor): void {
    let pos = 1;
    editor.state.doc.descendants((node, nodePos) => {
        if (pos === 1 && node.type.name === "tableCell") {
            pos = nodePos + 2;
        }
        return pos === 1;
    });
    editor.commands.setTextSelection(pos);
}

/** Merges attrs into the table that contains the cursor. */
function setTableAttrs(editor: Editor, attrs: Record<string, unknown>): void {
    const { $from } = editor.state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (node.type.name === "table") {
            editor.view.dispatch(
                editor.state.tr.setNodeMarkup($from.before(depth), undefined, { ...node.attrs, ...attrs })
            );
            return;
        }
    }
}

const TABLE_HTML = "<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>";

describe("TableBackgroundColor NodeView — class format borders", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("syncs each border data attribute independently without inline border styles", () => {
        editor = makeEditor("class");
        editor.commands.setContent(TABLE_HTML);
        placeCursorInFirstCell(editor);

        setTableAttrs(editor, { borderColor: "#d33115", borderStyle: "dashed", borderWidth: "3px" });
        const table = editor.view.dom.querySelector("table") as HTMLTableElement;
        expect(table.getAttribute("data-border-color")).toBe("#d33115");
        expect(table.getAttribute("data-border-style")).toBe("dashed");
        expect(table.getAttribute("data-border-width")).toBe("3px");
        expect(table.classList.contains("has-table-border")).toBe(true);
        expect(table.style.borderColor).toBe("");
        expect(table.style.borderStyle).toBe("");
        expect(table.style.borderWidth).toBe("");

        // Clearing only the color must not leave a stale data-border-color behind.
        setTableAttrs(editor, { borderColor: null });
        expect(table.hasAttribute("data-border-color")).toBe(false);
        expect(table.getAttribute("data-border-style")).toBe("dashed");
        expect(table.getAttribute("data-border-width")).toBe("3px");
        expect(table.classList.contains("has-table-border")).toBe(true);

        // Clearing only the width keeps the remaining style.
        setTableAttrs(editor, { borderWidth: null });
        expect(table.hasAttribute("data-border-width")).toBe(false);
        expect(table.getAttribute("data-border-style")).toBe("dashed");
        expect(table.classList.contains("has-table-border")).toBe(true);

        setTableAttrs(editor, { borderStyle: null });
        expect(table.hasAttribute("data-border-style")).toBe(false);
        expect(table.classList.contains("has-table-border")).toBe(false);
    });
});

const SIZED_CLASS_HTML =
    '<table data-width="400px" data-min-height="120px"><tbody>' +
    '<tr><th data-cell-width="150px" data-cell-height="40px">H</th><th>H2</th></tr>' +
    '<tr><td data-cell-width="150px" data-cell-height="40px">A</td><td>B</td></tr>' +
    "</tbody></table>";

/** Opening tags of every table, col, td and th element in the serialized HTML. */
function tableTags(html: string): string[] {
    return html.match(/<(table|col|td|th)\b[^>]*>/g) ?? [];
}

describe("Table sizes — class format", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("saves table, column and cell sizes as data attributes without any style attribute", () => {
        editor = makeEditor("class");
        editor.commands.setContent(SIZED_CLASS_HTML);
        const html = editor.getHTML();

        expect(html).toContain('<table data-width="400px" data-min-height="120px">');
        expect(html).toContain('<colgroup><col data-col-width="150px"><col></colgroup>');
        expect(html).toContain('<th colspan="1" rowspan="1" data-cell-width="150px" data-cell-height="40px">');
        expect(html).toContain('<td colspan="1" rowspan="1" data-cell-width="150px" data-cell-height="40px">');
        const tags = tableTags(html);
        expect(tags.length).toBe(7);
        for (const tag of tags) {
            expect(tag).not.toContain("style=");
        }
    });

    it("does not persist the column-derived table width", () => {
        editor = makeEditor("class");
        editor.commands.setContent(
            '<table><tbody><tr><td data-cell-width="150px">A</td><td data-cell-width="100px">B</td></tr></tbody></table>'
        );
        expect(tableTags(editor.getHTML())[0]).toBe("<table>");
    });

    it("round-trips sizes through getHTML/setContent", () => {
        editor = makeEditor("class");
        editor.commands.setContent(SIZED_CLASS_HTML);
        const html = editor.getHTML();

        editor.commands.setContent(html);
        expect(editor.getHTML()).toBe(html);
        const table = editor.state.doc.firstChild!;
        expect(table.attrs.width).toBe("400px");
        expect(table.attrs.minHeight).toBe("120px");
        expect(table.firstChild!.firstChild!.attrs.cellWidth).toBe("150px");
        expect(table.firstChild!.firstChild!.attrs.cellHeight).toBe("40px");
    });

    it("still loads sizes from older class-format content that has inline style widths", () => {
        editor = makeEditor("class");
        editor.commands.setContent(
            '<table style="width: 400px; min-height: 120px;" data-width="400px" data-min-height="120px">' +
                '<colgroup><col style="width: 150px;"><col></colgroup><tbody>' +
                '<tr><td style="width: 150px; height: 40px;" data-cell-width="150px" data-cell-height="40px">A</td>' +
                '<td style="width: 80px; height: 30px;">B</td></tr>' +
                "</tbody></table>"
        );
        const table = editor.state.doc.firstChild!;
        const row = table.firstChild!;
        expect(table.attrs.width).toBe("400px");
        expect(table.attrs.minHeight).toBe("120px");
        expect(row.child(0).attrs.cellWidth).toBe("150px");
        expect(row.child(0).attrs.cellHeight).toBe("40px");
        // Cells without data attributes fall back to their inline style
        expect(row.child(1).attrs.cellWidth).toBe("80px");
        expect(row.child(1).attrs.cellHeight).toBe("30px");

        // Saving again moves everything to data attributes
        const html = editor.getHTML();
        expect(html).toContain('<col data-col-width="150px"><col data-col-width="80px">');
        expect(html).toContain('data-cell-width="80px" data-cell-height="30px"');
        expect(html).not.toContain("style=");
    });

    it("renders and updates sizes without ever setting a style attribute", () => {
        const setAttribute = jest.spyOn(Element.prototype, "setAttribute");
        try {
            editor = makeEditor("class");
            editor.commands.setContent(SIZED_CLASS_HTML);
            placeCursorInFirstCell(editor);
            editor.commands.setTableWidth("500px");
            editor.commands.setTableMinHeight("200px");
            editor.commands.setCellAttribute("cellWidth", "220px");
            editor.commands.setCellAttribute("cellHeight", "60px");
            const html = editor.getHTML();

            expect(html).toContain('<table data-width="500px" data-min-height="200px">');
            expect(html).toContain('data-cell-width="220px" data-cell-height="60px"');
            expect(setAttribute.mock.calls.length).toBeGreaterThan(0);
            expect(setAttribute.mock.calls.filter(([name]) => name.toLowerCase() === "style")).toEqual([]);
        } finally {
            setAttribute.mockRestore();
        }
    });
});

describe("Table sizes — inline format", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    // Expected strings are the inline renderer's output before the class-format sizing change.
    it("keeps the explicit-size output unchanged", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(
            '<table style="width: 400px; min-height: 120px"><tbody>' +
                '<tr><th style="width: 150px; height: 40px">H</th><th>H2</th></tr>' +
                '<tr><td style="width: 150px; height: 40px">A</td><td>B</td></tr>' +
                "</tbody></table>"
        );
        expect(editor.getHTML()).toBe(
            '<table style="width: 400px; min-height: 120px;"><colgroup><col style="width: 150px;"><col></colgroup><tbody>' +
                '<tr><th colspan="1" rowspan="1" style="width: 150px; height: 40px;"><p>H</p></th><th colspan="1" rowspan="1"><p>H2</p></th></tr>' +
                '<tr><td colspan="1" rowspan="1" style="width: 150px; height: 40px;"><p>A</p></td><td colspan="1" rowspan="1"><p>B</p></td></tr>' +
                "</tbody></table><p></p>"
        );
    });

    it("keeps the column-derived width, colors and borders unchanged", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(
            "<table><tbody><tr>" +
                '<td style="width: 150px; height: 40px; background-color: #00ff00; border-color: #d33115">A</td>' +
                '<td style="width: 30%">B</td>' +
                "</tr></tbody></table>"
        );
        expect(editor.getHTML()).toBe(
            '<table style="min-width: 175px;"><colgroup><col style="width: 150px;"><col style="width: 30%;"></colgroup><tbody><tr>' +
                '<td colspan="1" rowspan="1" style="width: 150px; height: 40px; background-color: rgb(0, 255, 0); border-style: solid; border-width: 1px; border-color: rgb(211, 49, 21);"><p>A</p></td>' +
                '<td colspan="1" rowspan="1" style="width: 30%;"><p>B</p></td>' +
                "</tr></tbody></table><p></p>"
        );
    });
});
