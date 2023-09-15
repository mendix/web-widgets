import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";
import { AlignmentEnum, ColumnsPreviewType, WidthEnum, ColumnsType, HidableEnum } from "../../typings/DatagridProps";

export interface GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;
    canHide: boolean;
    canResize: boolean;
    canSort: boolean;
    header: string;
    hidable: HidableEnum;
    hidden: boolean;
    id: string;
    index: number;
    weight: number;
    width: WidthEnum;
}

const isSortable = (column: ColumnsType | ColumnsPreviewType): boolean => {
    // Handle case for editorPreview
    const attrSortable = typeof column.attribute === "string" || !!column.attribute?.sortable;

    return column.sortable && attrSortable;
};

export function fromColumnsType(col: ColumnsType, index: number): GridColumn {
    return {
        alignment: col.alignment,
        canDrag: col.draggable,
        canHide: col.hidable !== "no",
        canResize: col.resizable,
        canSort: isSortable(col),
        header: col.header && isAvailable(col.header) ? col.header.value ?? "" : "",
        hidable: col.hidable,
        hidden: col.hidable === "hidden",
        id: index.toString(),
        index,
        weight: col.size ?? 1,
        width: col.width
    };
}

export function fromColumnsPreviewType(col: ColumnsPreviewType, index: number): GridColumn {
    return {
        alignment: col.alignment,
        canDrag: false,
        canHide: col.hidable !== "no",
        canResize: false,
        canSort: isSortable(col),
        header: (col.header?.trim().length ?? 0) === 0 ? "[Empty caption]" : col.header,
        hidable: col.hidable,
        hidden: col.hidable === "hidden",
        id: index.toString(),
        index,
        weight: col.size ?? 1,
        width: col.width
    };
}

export function sortColumns(columnsOrder: string[], columnA: GridColumn, columnB: GridColumn): number {
    let columnAValue = columnsOrder.findIndex(c => c === columnA.id);
    let columnBValue = columnsOrder.findIndex(c => c === columnB.id);
    if (columnAValue < 0) {
        columnAValue = Number(columnA.id);
    }
    if (columnBValue < 0) {
        columnBValue = Number(columnB.id);
    }
    return columnAValue < columnBValue ? -1 : columnAValue > columnBValue ? 1 : 0;
}
