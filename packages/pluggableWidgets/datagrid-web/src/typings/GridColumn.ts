import { ObjectItem, ListValue } from "mendix";
import { ReactElement } from "react";
import { AlignmentEnum, WidthEnum } from "../../typings/DatagridProps";

export type ColumnId = string & { __columnIdTag: never };
export type SortInstruction = ListValue["sortOrder"] extends Array<infer T> ? T : never;

/**
 * A generic column type for data grid.
 */
export interface GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;
    canHide: boolean;
    canResize: boolean;
    canSort: boolean;
    columnClass(item: ObjectItem): string | undefined;
    columnId: ColumnId;
    columnNumber: number;
    header: string;
    initiallyHidden: boolean;
    renderCellContent: (item: ObjectItem) => ReactElement;
    sortInstruction(dir: "asc" | "desc"): SortInstruction | undefined;
    visible: boolean;
    weight: number;
    width: WidthEnum;
    wrapText: boolean;
}
