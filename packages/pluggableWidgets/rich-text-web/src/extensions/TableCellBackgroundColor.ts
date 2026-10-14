import { TableCell } from "@tiptap/extension-table-cell";
import { DOMOutputSpec } from "@tiptap/pm/model";
import {
    buildCellStylingAttributes,
    CellStylingOptions,
    renderCellHTML,
    sharedCellBorderCommands
} from "./tableCellStyling";

export type TableCellBackgroundColorOptions = CellStylingOptions;

export const TableCellBackgroundColor = TableCell.extend<TableCellBackgroundColorOptions>({
    addOptions() {
        return {
            ...this.parent?.(),
            styleDataFormat: "inline"
        };
    },

    addAttributes() {
        return {
            ...this.parent?.(),
            ...buildCellStylingAttributes(this.options.styleDataFormat)
        };
    },

    renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
        return renderCellHTML("td", node, HTMLAttributes, this.options.styleDataFormat);
    },

    addCommands() {
        return {
            ...this.parent?.(),
            ...sharedCellBorderCommands()
        };
    }
});
