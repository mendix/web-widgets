import { ListValue, ObjectItem } from "mendix";
import { ReactElement } from "react";
import { AlignmentEnum } from "../../../typings/DatagridProps";

export type ColumnId = string & { __columnIdTag: never };

export type SortInstruction = ListValue["sortOrder"] extends Array<infer T> ? T : never;

export type SortDirection = SortInstruction[1];

export type SortRule = [columnId: ColumnId, dir: SortDirection];

/**
 * A generic column type for data grid.
 */
export interface GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;

    columnClass(item: ObjectItem): string | undefined;
    columnId: ColumnId;
    columnIndex: number;
    header: string;
    initiallyHidden: boolean;
    renderCellContent: (item: ObjectItem) => ReactElement;
    isAvailable: boolean;
    wrapText: boolean;

    canHide: boolean;
    isHidden: boolean;
    toggleHidden(): void;

    canSort: boolean;
    sortDir: SortDirection | undefined;
    toggleSort(): void;

    canResize: boolean;
    size: number | undefined;
    setSize(size: number): void;
    getCssWidth(): string;
    setHeaderElementRef(ref: HTMLDivElement | null): void;
}
