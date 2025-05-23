import type { BlockBlot } from "parchment";
import Quill from "quill";
import QuillHeader from "quill/formats/header";
import type { Props, TableCellChildren } from "../types";
import { getCellFormats, getCorrectCellBlot } from "../utils";
import { ListContainer } from "./list";
import { TableCell, TableCellBlock } from "./table";

const Header = QuillHeader as typeof BlockBlot;

class TableHeader extends Header {
    static blotName = "table-header";
    static className = "ql-table-header";

    // @ts-ignore
    next: this | null;
    // @ts-ignore
    parent: TableCell;

    static create(formats: Props) {
        const { cellId, value } = formats;
        const node = super.create(value);
        node.setAttribute("data-cell", cellId);
        return node;
    }

    format(name: string, value: string | Props, isReplace?: boolean) {
        if (name === "header") {
            const _value = this.statics.formats(this.domNode).value;
            const cellId = this.domNode.getAttribute("data-cell");
            if (_value == value || !value) {
                this.replaceWith(TableCellBlock.blotName, cellId);
            } else {
                super.format("table-header", { cellId, value });
            }
        } else if (name === "list") {
            const [formats, cellId] = this.getCellFormats(this.parent);
            if (isReplace) {
                this.wrap(ListContainer.blotName, { ...formats, cellId });
            } else {
                this.wrap(TableCell.blotName, formats);
            }
            return this.replaceWith("table-list", value);
        } else if (name === TableCell.blotName) {
            return this.wrap(name, value);
        } else if (name === this.statics.blotName && !value) {
            const cellId = this.domNode.getAttribute("data-cell");
            this.replaceWith(TableCellBlock.blotName, cellId);
        } else {
            super.format(name, value);
        }
    }

    static formats(domNode: HTMLElement) {
        const cellId = domNode.getAttribute("data-cell");
        const value = this.tagName.indexOf(domNode.tagName) + 1;
        return { cellId, value };
    }

    formats() {
        const formats = this.attributes.values();
        const format = this.statics.formats(this.domNode, this.scroll);
        if (format != null) {
            formats[this.statics.blotName] = format;
        }
        return formats;
    }

    getCellFormats(parent: TableCell | TableCellChildren) {
        const cellBlot = getCorrectCellBlot(parent);
        return getCellFormats(cellBlot!);
    }
}

Quill.register(
    {
        "formats/table-header": TableHeader
    },
    true
);

export default TableHeader;
