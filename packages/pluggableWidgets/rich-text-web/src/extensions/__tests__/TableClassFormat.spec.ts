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

/** Places the cursor inside the first data cell. */
function placeCursorInFirstCell(editor: Editor): void {
    let pos = 1;
    editor.state.doc.descendants((node, nodePos) => {
        if (pos === 1 && node.type.name === "tableCell") {
            pos = nodePos + 1;
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
