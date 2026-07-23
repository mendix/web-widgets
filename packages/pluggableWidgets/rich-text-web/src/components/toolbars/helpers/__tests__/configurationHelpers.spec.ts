import { Editor } from "@tiptap/core";
import { TableRow } from "@tiptap/extension-table-row";
import { StarterKit } from "@tiptap/starter-kit";
import { TableBackgroundColor } from "../../../../extensions/TableBackgroundColor";
import { TableCellBackgroundColor } from "../../../../extensions/TableCellBackgroundColor";
import { TableHeaderBackgroundColor } from "../../../../extensions/TableHeaderBackgroundColor";
import { ConfigurationSection } from "../../ToolbarConfig";
import { createCellConfigurationSections, createTableConfigurationSections } from "../configurationHelpers";

const t = (key: string): string => key;

function makeEditor(): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({
        element,
        extensions: [
            StarterKit,
            TableBackgroundColor.configure({ resizable: true, styleDataFormat: "inline" }),
            TableRow,
            TableHeaderBackgroundColor.configure({ styleDataFormat: "inline" }),
            TableCellBackgroundColor.configure({ styleDataFormat: "inline" })
        ]
    });
}

const TABLE_HTML = "<table><tbody>" + "<tr><th>Header</th></tr>" + "<tr><td>Data</td></tr>" + "</tbody></table>";

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

function section(sections: ConfigurationSection[], id: string): ConfigurationSection {
    const found = sections.find(s => s.id === id);
    if (!found) {
        throw new Error(`Section ${id} not found`);
    }
    return found;
}

describe("configurationHelpers — color section onClear", () => {
    let editor: Editor;
    afterEach(() => editor?.destroy());

    it("exposes onClear for all color sections", () => {
        editor = makeEditor();
        const tableSections = createTableConfigurationSections(editor, t);
        const cellSections = createCellConfigurationSections(editor, t);

        expect(section(tableSections, "tableBackground").onClear).toBeDefined();
        expect(section(tableSections, "tableBorderColor").onClear).toBeDefined();
        expect(section(cellSections, "cellBackground").onClear).toBeDefined();
        expect(section(cellSections, "cellBorderColor").onClear).toBeDefined();
    });

    it("clears the cell background color", () => {
        editor = makeEditor();
        editor.commands.setContent(TABLE_HTML);
        placeCursorInNode(editor, "tableCell");
        const sections = createCellConfigurationSections(editor, t);

        section(sections, "cellBackground").onChange("#00ff00");
        section(sections, "cellBackground").onClear!();

        const td = editor.getHTML().match(/<td[^>]*>/)?.[0] ?? "";
        expect(td).not.toContain("background-color");
    });

    it("clears the cell border color", () => {
        editor = makeEditor();
        editor.commands.setContent(TABLE_HTML);
        placeCursorInNode(editor, "tableCell");
        const sections = createCellConfigurationSections(editor, t);

        section(sections, "cellBorderColor").onChange("#123456");
        section(sections, "cellBorderColor").onClear!();

        const td = editor.getHTML().match(/<td[^>]*>/)?.[0] ?? "";
        expect(td).not.toContain("border-color");
    });

    it("clears the table background color", () => {
        editor = makeEditor();
        editor.commands.setContent(TABLE_HTML);
        placeCursorInNode(editor, "tableCell");
        const sections = createTableConfigurationSections(editor, t);

        section(sections, "tableBackground").onChange("#00ff00");
        section(sections, "tableBackground").onClear!();

        const table = editor.getHTML().match(/<table[^>]*>/)?.[0] ?? "";
        expect(table).not.toContain("background-color");
    });

    it("clears the table border color", () => {
        editor = makeEditor();
        editor.commands.setContent(TABLE_HTML);
        placeCursorInNode(editor, "tableCell");
        const sections = createTableConfigurationSections(editor, t);

        section(sections, "tableBorderColor").onChange("#123456");
        section(sections, "tableBorderColor").onClear!();

        const table = editor.getHTML().match(/<table[^>]*>/)?.[0] ?? "";
        expect(table).not.toContain("border-color");
    });
});
