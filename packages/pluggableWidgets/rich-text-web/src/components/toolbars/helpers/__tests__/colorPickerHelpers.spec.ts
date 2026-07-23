import { Editor } from "@tiptap/core";
import { TableRow } from "@tiptap/extension-table-row";
import { TextStyle } from "@tiptap/extension-text-style";
import { StarterKit } from "@tiptap/starter-kit";
import { TableBackgroundColor } from "../../../../extensions/TableBackgroundColor";
import { TableCellBackgroundColor } from "../../../../extensions/TableCellBackgroundColor";
import { TableHeaderBackgroundColor } from "../../../../extensions/TableHeaderBackgroundColor";
import { TextColorClass } from "../../../../extensions/TextColorClass";
import { TextHighlightClass } from "../../../../extensions/TextHighlightClass";
import { colorPickerHelpers } from "../colorPickerHelpers";

function makeEditor(): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [
            StarterKit,
            TextStyle,
            TextColorClass.configure({ types: ["textStyle"], styleDataFormat: "inline" }),
            TextHighlightClass.configure({ multicolor: true, styleDataFormat: "inline" }),
            TableBackgroundColor.configure({ resizable: true, styleDataFormat: "inline" }),
            TableRow,
            TableHeaderBackgroundColor.configure({ styleDataFormat: "inline" }),
            TableCellBackgroundColor.configure({ styleDataFormat: "inline" })
        ]
    });
}

/** Places the cursor inside the first node of the given type. */
function placeCursorInNode(editor: Editor, typeName: string): void {
    let pos = 1;
    let found = false;
    editor.state.doc.descendants((node, nodePos) => {
        if (found) {
            return false;
        }
        if (node.type.name === typeName) {
            pos = nodePos + 1;
            found = true;
            return false;
        }
        return true;
    });
    editor.commands.setTextSelection(pos);
}

const TABLE_HTML = "<table><tbody>" + "<tr><th>Header</th></tr>" + "<tr><td>Data</td></tr>" + "</tbody></table>";

describe("colorPickerHelpers.handleColorClear", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("clears the cell background color", () => {
        editor = makeEditor();
        editor.commands.setContent(TABLE_HTML);
        placeCursorInNode(editor, "tableCell");
        editor.chain().focus().setCellAttribute("backgroundColor", "#00ff00").run();

        colorPickerHelpers.handleColorClear(editor, "cellBackground");

        const td = editor.getHTML().match(/<td[^>]*>/)?.[0] ?? "";
        expect(td).not.toContain("background-color");
    });

    it("clears the table background color", () => {
        editor = makeEditor();
        editor.commands.setContent(TABLE_HTML);
        placeCursorInNode(editor, "tableCell");
        colorPickerHelpers.handleColorChange(editor, "tableBackground", "#00ff00");

        colorPickerHelpers.handleColorClear(editor, "tableBackground");

        const table = editor.getHTML().match(/<table[^>]*>/)?.[0] ?? "";
        expect(table).not.toContain("background-color");
    });

    it("clears the table border color", () => {
        editor = makeEditor();
        editor.commands.setContent(TABLE_HTML);
        placeCursorInNode(editor, "tableCell");
        colorPickerHelpers.handleColorChange(editor, "tableBorderColor", "#123456");

        colorPickerHelpers.handleColorClear(editor, "tableBorderColor");

        const table = editor.getHTML().match(/<table[^>]*>/)?.[0] ?? "";
        expect(table).not.toContain("border-color");
    });

    it("clears the text color", () => {
        editor = makeEditor();
        editor.commands.setContent("<p>hello</p>");
        editor.commands.selectAll();
        colorPickerHelpers.handleColorChange(editor, "textColor", "#ff0000");

        colorPickerHelpers.handleColorClear(editor, "textColor");

        expect(editor.getHTML()).not.toContain("color:");
    });

    it("clears the text highlight", () => {
        editor = makeEditor();
        editor.commands.setContent("<p>hello</p>");
        editor.commands.selectAll();
        colorPickerHelpers.handleColorChange(editor, "textHighlight", "#ffff00");

        colorPickerHelpers.handleColorClear(editor, "textHighlight");

        expect(editor.getHTML()).not.toContain("<mark");
    });
});
