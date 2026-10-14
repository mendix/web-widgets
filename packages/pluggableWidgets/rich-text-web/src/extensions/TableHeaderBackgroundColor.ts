import { TableHeader } from "@tiptap/extension-table-header";
import { DOMOutputSpec } from "@tiptap/pm/model";
import {
    buildCellStylingAttributes,
    CellStylingOptions,
    renderCellHTML,
    sharedCellBorderCommands
} from "./tableCellStyling";

export type TableHeaderBackgroundColorOptions = CellStylingOptions;

export const TableHeaderBackgroundColor = TableHeader.extend<TableHeaderBackgroundColorOptions>({
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
        return renderCellHTML("th", node, HTMLAttributes, this.options.styleDataFormat);
    },

    addCommands() {
        return {
            ...this.parent?.(),
            ...sharedCellBorderCommands()
        };
    }
});
