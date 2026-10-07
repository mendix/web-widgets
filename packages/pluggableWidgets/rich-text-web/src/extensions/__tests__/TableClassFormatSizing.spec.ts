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

/** Wraps table attributes and a single row of cells into table HTML. */
function tableHtml(tableAttrs: string, cells: string): string {
    return `<table ${tableAttrs}><tbody><tr>${cells}</tr></tbody></table>`;
}

/** Extracts the opening tags of the given element from serialized HTML. */
function tags(html: string, name: string): string[] {
    return html.match(new RegExp(`<${name}(\\s[^>]*)?>`, "g")) ?? [];
}

function tableNodeAttrs(editor: Editor): Record<string, any> {
    return editor.state.doc.firstChild!.attrs;
}

describe("table sizing — class format", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("serializes explicit table width and min-height as data attributes only", () => {
        editor = makeEditor("class");
        editor.commands.setContent(tableHtml('data-width="600px" data-min-height="300px"', "<td>A</td>"));

        const [table] = tags(editor.getHTML(), "table");
        expect(table).toContain('data-width="600px"');
        expect(table).toContain('data-min-height="300px"');
        expect(table).not.toContain("data-width-derived");
        expect(table).not.toContain("data-min-width");
        expect(table).not.toContain("style=");
    });

    it("serializes a column-derived fixed width as a flagged data-width", () => {
        editor = makeEditor("class");
        editor.commands.setContent(
            tableHtml("", '<td data-cell-width="100px">A</td><td data-cell-width="150px">B</td>')
        );

        const [table] = tags(editor.getHTML(), "table");
        expect(table).toContain('data-width="250px"');
        expect(table).toContain('data-width-derived="true"');
        expect(table).not.toContain("data-min-width");
        expect(table).not.toContain("style=");
    });

    it("serializes a column-derived minimum width as data-min-width", () => {
        editor = makeEditor("class");
        editor.commands.setContent(tableHtml("", '<td data-cell-width="100px">A</td><td>B</td>'));

        const [table] = tags(editor.getHTML(), "table");
        expect(table).toContain('data-min-width="125px"');
        expect(table).not.toContain("data-width=");
        expect(table).not.toContain("style=");
    });

    it("lets an explicit width win over the column-derived one", () => {
        editor = makeEditor("class");
        editor.commands.setContent(tableHtml('data-width="600px"', '<td data-cell-width="100px">A</td><td>B</td>'));

        const [table] = tags(editor.getHTML(), "table");
        expect(table).toContain('data-width="600px"');
        expect(table).not.toContain("data-width-derived");
        expect(table).not.toContain("data-min-width");
    });

    it("does not read a column-derived width back as an explicit width", () => {
        editor = makeEditor("class");
        editor.commands.setContent(tableHtml("", '<td data-cell-width="100px">A</td>'));
        const saved = editor.getHTML();
        expect(saved).toContain('data-width-derived="true"');

        editor.commands.setContent(saved);
        expect(tableNodeAttrs(editor).width).toBeNull();
    });

    it("carries column widths in data-col-width without a style attribute", () => {
        editor = makeEditor("class");
        editor.commands.setContent(
            tableHtml("", '<td data-cell-width="250px">A</td><td data-cell-width="50%">B</td><td>C</td>')
        );

        const cols = tags(editor.getHTML(), "col");
        expect(cols).toHaveLength(3);
        expect(cols[0]).toContain('data-col-width="250px"');
        expect(cols[1]).toContain('data-col-width="50%"');
        expect(cols[2]).not.toContain("data-col-width");
        cols.forEach(col => expect(col).not.toContain("style="));
    });

    it.each(["td", "th"])("serializes <%s> width and height as data attributes only", tag => {
        editor = makeEditor("class");
        editor.commands.setContent(tableHtml("", `<${tag} data-cell-width="250px" data-cell-height="80px">A</${tag}>`));

        const [cell] = tags(editor.getHTML(), tag);
        expect(cell).toContain('data-cell-width="250px"');
        expect(cell).toContain('data-cell-height="80px"');
        expect(cell).not.toContain("style=");
    });

    it("normalizes previously saved content that carries both style and data attributes", () => {
        editor = makeEditor("class");
        editor.commands.setContent(
            tableHtml(
                'style="width: 600px; min-height: 300px" data-width="600px" data-min-height="300px"',
                '<td style="width: 250px; height: 80px" data-cell-width="250px" data-cell-height="80px">A</td>'
            )
        );

        const html = editor.getHTML();
        const [table] = tags(html, "table");
        const [col] = tags(html, "col");
        const [cell] = tags(html, "td");
        expect(table).toContain('data-width="600px"');
        expect(table).toContain('data-min-height="300px"');
        expect(col).toContain('data-col-width="250px"');
        expect(cell).toContain('data-cell-width="250px"');
        expect(cell).toContain('data-cell-height="80px"');
        expect(html).not.toContain("style=");
    });

    it("keeps the editable table free of inline sizing", () => {
        editor = makeEditor("class");
        editor.commands.setContent(
            tableHtml('data-width="600px" data-min-height="300px"', '<td data-cell-width="250px">A</td>')
        );

        const table = editor.view.dom.querySelector("table")!;
        expect(table.getAttribute("data-width")).toBe("600px");
        expect(table.getAttribute("data-min-height")).toBe("300px");
        expect(table.style.width).toBe("");
        expect(table.style.minHeight).toBe("");

        const col = table.querySelector("col")!;
        expect(col.getAttribute("data-col-width")).toBe("250px");
        expect(col.style.width).toBe("");
    });

    it("replaces the explicit width with the column-derived one when it is cleared", () => {
        editor = makeEditor("class");
        editor.commands.setContent(tableHtml('data-width="600px"', '<td data-cell-width="250px">A</td>'));
        editor.commands.setTextSelection(4);
        editor.commands.setTableWidth(null);

        const table = editor.view.dom.querySelector("table")!;
        expect(table.getAttribute("data-width")).toBe("250px");
        expect(table.getAttribute("data-width-derived")).toBe("true");
    });
});

describe("table sizing — inline format", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("keeps table, column and cell sizing in inline style", () => {
        editor = makeEditor("inline");
        editor.commands.setContent(
            tableHtml('style="width: 600px; min-height: 300px"', '<td style="width: 250px; height: 80px">A</td>')
        );

        const html = editor.getHTML();
        const [table] = tags(html, "table");
        const [col] = tags(html, "col");
        const [cell] = tags(html, "td");
        expect(table).toContain("width: 600px");
        expect(table).toContain("min-height: 300px");
        expect(col).toContain("width: 250px");
        expect(cell).toContain("width: 250px");
        expect(cell).toContain("height: 80px");
        expect(html).not.toMatch(/data-(width|min-width|min-height|col-width|cell-width|cell-height)/);
    });
});
